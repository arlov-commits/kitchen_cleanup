/* End-to-end checks in Chromium: NODE_PATH=$(npm root -g) node tests/app.e2e.js
   Needs Playwright (preinstalled in Claude Code cloud sessions) and python3.
   Serves the repo, then drives every screen: picking a name, the shift
   cards, backups, the My availability tab, the tabs, the Sunday badge, settings,
   load errors, the theme button, Install as app, layout at three widths in
   both modes, offline use and the service worker's self-update. */
"use strict";
var chromium = require("playwright").chromium;
var cp = require("child_process"), fs = require("fs"), os = require("os"), path = require("path");
/* random ports, so a server left over from an earlier run can't answer instead */
var ROOT = path.join(__dirname, ".."), PORT = 20000 + Math.floor(Math.random() * 20000), BASE = "http://localhost:" + PORT + "/";

var passed = 0, failed = 0;
function check(label, got, want) {
  var g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) passed++; else { failed++; console.log("FAIL " + label + "\n  got  " + g + "\n  want " + w); }
}
function truthy(label, v) { check(label, !!v, true); }

/* The expected answers, independent of the app's code: the cover lists
   and swap options come from tests/expected-cover-lists.csv (worked out by
   a separate Python copy of the rules), and the work groups and role order
   straight from roles.csv. */
function rowsOf(file) {
  var text = fs.readFileSync(path.join(ROOT, file), "utf8").replace(/^\uFEFF/, ""), rows = [], row = [], f = "", q = false;
  for (var i = 0; i < text.length; i++) {
    var c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += c; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(f); rows.push(row); row = []; f = ""; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows.slice(1).filter(function (r) { return r.join(""); });
}
var ROWS = rowsOf("tests/expected-cover-lists.csv").map(function (r) {
  var swaps = {};
  (r[5] || "").split("; ").filter(Boolean).forEach(function (part) {
    var m = part.match(/^(.*?): (.*)$/);
    swaps[m[1]] = m[2] === "none" ? [] : m[2].split(", ").map(function (x) { var w = x.split(" "); return { day: w[0], as: w.slice(1).join(" ") }; });
  });
  return { who: r[0], day: r[1], role: r[2], cover: r[3].split(",").map(function (s) { return s.trim(); }).filter(Boolean), before: +r[4], swaps: swaps };
});
var ROLE = {};
rowsOf("roles.csv").forEach(function (r, i) { ROLE[r[0]] = { group: r[1] || r[0], as: r[2] || r[0], rank: i }; });
/* "Pots & Pans: Wed Thu | Recycling: Mon": shifts by role as covered (a
   Shift Leader shift counts as Pots & Pans), the given role first, then
   roles.csv order. Without shifts, all a student works. */
function worksOf(name, first, shifts) {
  var by = {};
  (shifts || ROWS.filter(function (r) { return r.who === name; }).map(function (r) { return { day: r.day, as: ROLE[r.role].as }; })).forEach(function (x) {
    var d = DAYS.indexOf(x.day);
    by[x.as] = by[x.as] || [];
    if (by[x.as].indexOf(d) < 0) by[x.as].push(d);
  });
  return Object.keys(by).sort(function (a, b) { return (b === first) - (a === first) || ROLE[a].rank - ROLE[b].rank; }).map(function (role) {
    return role + ": " + by[role].sort().map(function (d) { return DAYS[d].slice(0, 3); }).join(" ");
  }).join(" | ");
}
/* the same, read off a backup's line in the page */
function worksOnPage(li) {
  return [].map.call(li.querySelectorAll(".wk"), function (g) {
    return g.querySelector(".wr").textContent + ": " + [].map.call(g.querySelectorAll(".dp"), function (d) { return d.textContent; }).join(" ");
  }).join(" | ");
}
function crewOf(who, day, role) {
  return ROWS.filter(function (r) { return r.day === day && r.who !== who && ROLE[r.role].group === ROLE[role].group; })
    .sort(function (a, b) { return ROLE[a.role].rank - ROLE[b.role].rank || a.who.localeCompare(b.who); })
    .map(function (r) { return r.who + "|" + r.role; });
}
var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function serve(dir, port) {
  var p = cp.spawn("python3", ["-m", "http.server", String(port)], { cwd: dir, stdio: "ignore" });
  return new Promise(function (r) { setTimeout(function () { r(p); }, 700); });
}

(async function () {
  var server = await serve(ROOT, PORT);
  var browser = await chromium.launch();
  var errors = [];
  async function page(opts) {
    opts = opts || {};
    var ctx = await browser.newContext(Object.assign({ viewport: { width: 375, height: 780 }, serviceWorkers: "block" }, opts.ctx || {}));
    if (opts.init) await ctx.addInitScript(opts.init);
    var p = await ctx.newPage();
    p.on("pageerror", function (e) { errors.push(e.message); });
    if (opts.time) await p.clock.setFixedTime(new Date(opts.time));
    if (opts.data) await p.route("**/shifts.csv", function (r) { return opts.data === 404 ? r.fulfill({ status: 404, body: "" }) : r.fulfill({ body: opts.data }); });
    if (opts.students) await p.route("**/students.csv", function (r) { return r.fulfill({ body: opts.students }); });
    if (opts.settings) await p.route("**/settings.csv", function (r) { return opts.settings === 404 ? r.fulfill({ status: 404, body: "" }) : r.fulfill({ body: opts.settings }); });
    await ctx.route("https://www.drbu.edu/**", function (r) { return r.fulfill({ body: "portal" }); });
    return p;
  }
  function ready(p) { return p.waitForFunction(function () { return !document.getElementById("me").disabled; }); }
  function text(p, sel) { return p.$eval(sel, function (e) { return e.innerText.replace(/\s+/g, " ").trim(); }); }

  /* ---------------------------------------------------- picker & cards */
  var p = await page({ time: "2026-10-05T09:00:00" });               // a Monday
  await p.goto(BASE);
  await ready(p);
  var names = await p.$$eval("#me option", function (o) { return o.map(function (x) { return x.value; }); });
  check("picker: placeholder then every student", names, [""].concat(Array.from(new Set(ROWS.map(function (r) { return r.who; }))).sort()));
  check("empty state", await text(p, "#shifts-body"), "Choose your name above to see your shifts and who can cover them.");
  check("My availability with no name", [await text(p, "#avail-body"), await p.$eval("#avail-lead", function (e) { return e.hidden; })],
    ["Choose your name on My shifts to see the days you may be asked to cover.", true]);
  check("My availability is no longer under the shift cards", await p.$$eval("#view-shifts .avail-list, #view-shifts .band", function (e) { return e.length; }), 0);
  check("no name: a labelled list under the heading, no week at a glance", await p.evaluate(function () {
    return [document.getElementById("who").className, getComputedStyle(document.querySelector("#who label")).width !== "1px", document.getElementById("glance").hidden];
  }), ["who", true, true]);

  await p.selectOption("#me", "Aryashree");
  var mine = ROWS.filter(function (r) { return r.who === "Aryashree"; });
  check("name chosen: a pill with the name, still a labelled list", await p.evaluate(function () {
    var w = document.getElementById("who");
    return [w.className, document.getElementById("me-pill").textContent, document.querySelector("label[for=me]").textContent, document.getElementById("me").value];
  }), ["who set", "Aryashree", "Your name", "Aryashree"]);
  /* the week at a glance, on Monday October 5: each shift by its next date */
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function glanceOf(rows, now) {
    var today = (now.getDay() + 6) % 7;
    return rows.map(function (r) {
      var d = DAYS.indexOf(r.day), t = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (d - today + 7) % 7);
      return { t: t, line: r.day.slice(0, 3) + "|" + MON[t.getMonth()] + " " + t.getDate() + "|" + ROLE[r.role].as + "|" + (d === today ? "Today" : d === (today + 1) % 7 ? "Tomorrow" : "") };
    }).sort(function (a, b) { return a.t - b.t; }).map(function (x) { return x.line; });
  }
  function glanceOnPage(p) {
    return p.evaluate(function () {
      return [document.querySelector(".today").textContent].concat([].map.call(document.querySelectorAll(".gl li"), function (l) {
        return [].map.call(l.children, function (c) { return c.textContent; }).join("|");
      }));
    });
  }
  check("glance: today's date, then each shift by its next date, with Today and Tomorrow", await glanceOnPage(p),
    ["Today is Monday, October 5"].concat(glanceOf(mine, new Date(2026, 9, 5))));
  var cards = await p.$$eval(".shift", function (cs) {
    return cs.map(function (c) {
      return { day: c.querySelector("h2").firstChild.textContent, when: (c.querySelector(".when") || {}).textContent || "", tmrw: !!c.querySelector(".when.tmrw"),
               role: (c.querySelector(".role") || {}).textContent, crew: [].map.call(c.querySelectorAll(".crew li"), function (l) { return l.children[0].textContent + "|" + l.children[1].textContent; }),
               open: c.querySelector("details").open, summary: c.querySelector("summary").innerText.trim() };
    });
  });
  check("cards: days in week order", cards.map(function (c) { return c.day; }), mine.map(function (r) { return r.day; }));
  check("cards: Today / Tomorrow", cards.map(function (c) { return c.when + (c.tmrw ? "(outlined)" : ""); }), ["Today", "Tomorrow(outlined)", ""]);
  check("cards: own role, as covered", cards.map(function (c) { return c.role; }), mine.map(function (r) { return ROLE[r.role].as; }));
  cards.forEach(function (c) {
    check("on with you, " + c.day + ": own work group, in roles.csv order", c.crew, crewOf("Aryashree", c.day, c.role));
  });
  check("backups closed by default", cards.map(function (c) { return c.open; }), [false, false, false]);
  check("backups summary", cards.map(function (c) { return c.summary; }), mine.map(function (r) { return "SHIFT BACKUPS · " + r.cover.length; }));
  await p.click(".shift >> nth=0 >> summary");
  check("backups open: lead text", await text(p, ".shift >> nth=0 >> .cover-lead"), "Can cover for you");
  check("backups open: list in the reference order", await p.$$eval(".shift:first-of-type .cover .cn", function (l) { return l.map(function (x) { return x.textContent; }); }), mine[0].cover);
  check("backups open: each with what they work (role labels, day tags)", await p.$$eval(".shift:first-of-type .cover li", function (l, fn) {
    var works = new Function("return " + fn)();
    return l.map(function (x) { return x.querySelector(".cn").textContent + " = " + works(x); });
  }, worksOnPage.toString()), mine[0].cover.map(function (c) {
    /* the shifts she could take back, or all they work if none; her job first */
    var job = ROLE[mine[0].role].as, swaps = mine[0].swaps[c];
    return c + " = " + worksOf(c, job, swaps.length ? swaps : null);
  }));
  await p.click(".shift:nth-of-type(2) summary");
  var tue = ROWS.filter(function (r) { return r.who === "Aryashree" && r.day === "Tuesday"; })[0];
  check("last resort: boxed off, numbered on, with the reference's names", await p.$eval(".shift:nth-of-type(2) .backups", function (d) {
    var box = d.querySelector(".last");
    return box ? [box.querySelector(".last-h").textContent, box.querySelector("ol").getAttribute("start"),
      [].map.call(box.querySelectorAll(".cn"), function (x) { return x.textContent; }),
      [].map.call(d.querySelectorAll(":scope > ol .cn"), function (x) { return x.textContent; })] : null;
  }), ["Last resort", String(tue.before + 1), tue.cover.slice(tue.before), tue.cover.slice(0, tue.before)]);
  check("each backup shows the shifts you could swap them for; in the last resort, all they work", await p.$eval(".shift:nth-of-type(2) .backups", function (d, fn) {
    var works = new Function("return " + fn)(), out = {};
    [].forEach.call(d.querySelectorAll(".cover li"), function (li) { out[li.querySelector(".cn").textContent] = works(li); });
    return [out.Adrian, out.Amelia, out.Shuxing];
  }, worksOnPage.toString()), ["Pots & Pans: Wed Fri", "Pots & Pans: Mon | Buckets & Composting: Thu | Lunch Monitor: Wed", "Lunch Monitor: Mon Thu"]);
  check("day tags carry their day's colour", await p.$$eval(".shift:first-of-type .cover .dp", function (t) {
    var k = { Mon: "k0", Tue: "k1", Wed: "k2", Thu: "k3", Fri: "k4", Sat: "k5", Sun: "k6" };
    return t.every(function (x) { return x.classList.contains(k[x.textContent]); });
  }), true);
  check("summary unchanged when open", await text(p, ".shift >> nth=0 >> summary"), "SHIFT BACKUPS · " + mine[0].cover.length);
  var page1 = await p.$eval(".pane", function (e) { return e.innerText; });
  check("no Student Leader anywhere", /student leader/i.test(page1), false);
  check("gender never shown", /\bgender\b|\(M\)|\(F\)/i.test(page1), false);

  /* On with you, by work group */
  async function crews(who) {
    await p.selectOption("#me", who);
    return p.$$eval(".shift", function (cs) {
      return cs.map(function (c) {
        return c.querySelector("h2").firstChild.textContent + ": " + (c.querySelector(".crew") ? [].map.call(c.querySelectorAll(".crew li"), function (l) { return l.children[0].textContent; }).join(", ") : "(none)");
      });
    });
  }
  check("Recycling alone: no On with you; Dishwashing days list only Dishwashing", await crews("Adam"),
    ["Monday: " + crewOf("Adam", "Monday", "Pots & Pans").map(function (x) { return x.split("|")[0]; }).join(", "),
     "Tuesday: " + crewOf("Adam", "Tuesday", "Pots & Pans").map(function (x) { return x.split("|")[0]; }).join(", "),
     "Thursday: (none)"]);
  check("Recycling with two on: shows the other", (await crews("Adrian"))[0], "Monday: Vayu");
  await p.click(".shift:nth-of-type(2) summary");
  check("no Shift Leader in any substitute list or in My availability", await p.evaluate(function () {
    return [].some.call(document.querySelectorAll(".cover, #view-availability"), function (e) { return /shift leader/i.test(e.textContent); });
  }), false);
  check("Shift Leader's own card: Pots & Pans, nothing about leading", [await text(p, ".shift:nth-of-type(2) .role"), await text(p, ".shift:nth-of-type(2) .cover-lead")],
    ["Pots & Pans", "Can cover for you"]);
  async function leaderOutsideCrew(who) {
    await p.selectOption("#me", who);
    await p.evaluate(function () { document.querySelectorAll("details.backups").forEach(function (d) { d.open = true; }); });
    return p.evaluate(function () {
      var all = (document.querySelector(".pane").innerText.match(/shift leader/gi) || []).length;
      var crew = [].reduce.call(document.querySelectorAll(".crew"), function (n, c) { return n + (c.innerText.match(/shift leader/gi) || []).length; }, 0);
      return [all > 0 || crew === 0, all - crew];
    });
  }
  for (var w of ["Adrian", "Ivwananji", "Beth", "Adam"]) check("Shift Leader appears only in On with you: " + w, await leaderOutsideCrew(w), [true, 0]);
  check("and On with you shows the Shift Leader first", (await crews("Beth"))[0].split(": ")[1].split(", ")[0], "Adrian");
  check("Lunch Monitor: no On with you", await crews("Shuxing"), ["Monday: (none)", "Thursday: (none)"]);
  check("Kitchen never lists Recycling or Lunch Monitor", (await crews("Huiyi"))[0].indexOf("Adrian") < 0 && (await crews("Huiyi"))[0].indexOf("Shuxing") < 0, true);
  await p.selectOption("#me", "Aryashree");

  /* My availability: day covered, then your day in exchange, then the
     role you'd cover as, then who; the last resort at the end of the day */
  function availOf(me) {
    var avail = {};
    ROWS.forEach(function (r) {
      var at = r.cover.indexOf(me);
      if (at < 0) return;
      var day = avail[r.day] = avail[r.day] || {}, as = ROLE[r.role].as;
      (at < r.before ? r.swaps[me].map(function (x) { return x.day; }) : ["Last resort"]).forEach(function (back) {
        var g = day[back] = day[back] || {};
        (g[as] = g[as] || []).push(r.who);
      });
    });
    return DAYS.filter(function (d) { return avail[d]; }).map(function (d) {
      return d + " | " + DAYS.concat("Last resort").filter(function (b) { return avail[d][b]; }).map(function (b) {
        var g = avail[d][b];
        return (b === "Last resort" ? b : "In exchange for your " + b.slice(0, 3)) + " > " + Object.keys(g).sort(function (x, y) { return ROLE[x].rank - ROLE[y].rank; }).map(function (as) {
          return "As " + as + ": " + g[as].sort().join(", ");
        }).join(" / ");
      }).join(" | ");
    });
  }
  function availOnPage() {
    return p.$$eval(".avail-list li", function (l) {
      return l.map(function (x) {
        return x.querySelector(".d").textContent + " | " + [].map.call(x.querySelectorAll(".ax"), function (g) {
          return g.querySelector(".xh").textContent + " > " + [].map.call(g.querySelectorAll(".ag"), function (a) {
            return a.querySelector(".ar").textContent + ": " + a.querySelector(".an").textContent;
          }).join(" / ");
        }).join(" | ");
      });
    });
  }
  check("availability: by day, day in exchange, role, then who", await availOnPage(), availOf("Aryashree"));
  check("availability: exchange days carry their day's colour", await p.$$eval(".avail-list .xh .dp", function (t) {
    var k = { Mon: "k0", Tue: "k1", Wed: "k2", Thu: "k3", Fri: "k4", Sat: "k5", Sun: "k6" };
    return t.length > 0 && t.every(function (x) { return x.classList.contains(k[x.textContent]); });
  }), true);
  for (var who of ["Adam", "Ben Kong", "Ivwananji", "Thanh"]) {
    await p.selectOption("#me", who);
    check("availability: " + who, await availOnPage(), availOf(who));
  }
  await p.selectOption("#me", "Aryashree");
  check("availability: wrong-info line", await text(p, "#avail-body .note:last-child"), "Something here wrong or out of date? Send an email to the Student Kitchen Manager (Art).");
  check("availability: the lead names who it's for", await text(p, "#avail-lead"),
    "Aryashree, you're a backup on these days. Someone on that shift may ask you to cover, in exchange for a shift of yours.");
  await p.click("#bottom-nav a[href='#availability']");
  await p.waitForFunction(function () { return !document.getElementById("view-availability").hidden; });
  check("availability tab: its own view, between Call out and Submit Timesheet",
    [await p.$$eval("#bottom-nav a", function (a) { return a.map(function (x) { return x.textContent; }); }), await p.title(),
     await p.$$eval("main.view", function (v) { return v.filter(function (x) { return !x.hidden; }).map(function (x) { return x.id; }); })],
    [["My shifts", "Call out", "My availability", "Submit Timesheet"], "My availability · Kitchen Cleanup", ["view-availability"]]);
  check("availability tab: each day a card in its hue", await p.$$eval(".avail-list li", function (l) {
    return l.every(function (x) { return x.classList.contains("panel") && /\bk[0-6]\b/.test(x.className) && x.querySelector("h2.d"); });
  }), true);
  await p.goto(BASE); await ready(p);

  /* persistence */
  await p.reload(); await ready(p);
  check("name remembered", await p.inputValue("#me"), "Aryashree");
  await p.selectOption("#me", "");
  check("name cleared", await p.evaluate(function () { return localStorage.getItem("kitchen.me"); }), null);
  await p.evaluate(function () { localStorage.setItem("kitchen.me", "Ghost"); }); await p.reload(); await ready(p);
  check("unknown saved name dropped", [await p.inputValue("#me"), await p.evaluate(function () { return localStorage.getItem("kitchen.me"); })], ["", null]);
  check("footer: clean data", await text(p, "#data-status"), "Shift list: 17 students, 41 shifts a week.");

  /* ------------------------------------------------------------- tabs */
  await p.selectOption("#me", "Beth");
  await p.evaluate(function () { document.getElementById("scroll").scrollTop = 400; });
  await p.click("#bottom-nav a[href='#callout']");
  await p.waitForFunction(function () { return !document.getElementById("view-callout").hidden; });
  check("tab: hash", await p.evaluate(function () { return location.hash; }), "#callout");
  check("tab: views", await p.$$eval("main.view", function (v) { return v.map(function (x) { return x.id + ":" + !x.hidden; }); }), ["view-shifts:false", "view-callout:true", "view-availability:false", "view-timesheet:false"]);
  check("tab: title", await p.title(), "Call out · Kitchen Cleanup");
  check("tab: active", await p.$$eval("#bottom-nav a.active", function (a) { return a.map(function (x) { return x.textContent; }); }), ["Call out"]);
  check("tab: scrolled to top", await p.$eval("#scroll", function (e) { return e.scrollTop; }), 0);
  var call = await text(p, "#view-callout");
  check("call out: no bare Kitchen Manager", (call.match(/Kitchen Manager/g) || []).length, (call.match(/Student Kitchen Manager/g) || []).length);
  check("call out: headings", await p.$$eval(".path-h h2", function (h) { return h.map(function (x) { return x.textContent; }); }), ["Planned Absence", "Sick or Unexpected Absence"]);
  check("call out: contacts", await text(p, "#contacts"), "STUDENT KITCHEN MANAGER Art WORK STUDY MANAGER Nahelia");
  await p.goto(BASE + "#nope"); await ready(p);
  check("unknown hash shows My shifts", await p.$eval("#view-shifts", function (e) { return e.hidden; }), false);
  await p.goto(BASE + "#timesheet"); await ready(p);
  check("portal link", [await p.getAttribute(".portal", "href"), await text(p, ".portal-url")], ["https://www.drbu.edu/timesheet", "drbu.edu/timesheet"]);
  check("timesheet motto", await text(p, "#view-timesheet .motto"), "It's not done until your hours are submitted.");
  check("no badge on a Monday", await p.$$eval(".badge", function (b) { return b.length; }), 0);
  await p.context().close();

  /* -------------------------------------------------- Sunday badge */
  p = await page({ time: "2026-10-04T10:00:00" });                  // a Sunday
  await p.goto(BASE + "#timesheet"); await ready(p);
  check("badge on Sunday (one per nav)", await p.$$eval(".badge", function (b) { return b.map(function (x) { return x.textContent; }); }), ["1", "1"]);
  var popup = await Promise.all([p.context().waitForEvent("page"), p.click(".portal")]);
  check("portal opens in a new tab", popup[0].url(), "https://www.drbu.edu/timesheet");
  check("badge cleared by the portal button", await p.$$eval(".badge", function (b) { return b.length; }), 0);
  await p.reload(); await ready(p);
  check("badge stays cleared that Sunday", await p.$$eval(".badge", function (b) { return b.length; }), 0);
  await p.clock.setFixedTime(new Date("2026-10-11T10:00:00"));
  await p.reload(); await ready(p);
  check("badge back next Sunday", await p.$$eval(".badge", function (b) { return b.length; }), 2);
  await p.context().close();
  p = await page({ time: "2026-10-10T23:00:00" });                  // Saturday night, left open
  await p.goto(BASE); await ready(p);
  await p.clock.setFixedTime(new Date("2026-10-11T08:00:00"));
  await p.evaluate(function () { document.dispatchEvent(new Event("visibilitychange")); });
  check("badge appears when the app returns on Sunday", await p.$$eval(".badge", function (b) { return b.length; }), 2);
  await p.context().close();
  p = await page({ time: "2026-10-10T23:00:00", init: function () { localStorage.setItem("kitchen.me", "Adam"); } });   // Saturday night, left open
  await p.goto(BASE); await ready(p);
  var adam = ROWS.filter(function (r) { return r.who === "Adam"; });
  check("glance: Saturday", await glanceOnPage(p), ["Today is Saturday, October 10"].concat(glanceOf(adam, new Date(2026, 9, 10))));
  await p.clock.setFixedTime(new Date("2026-10-11T08:00:00"));
  await p.evaluate(function () { document.dispatchEvent(new Event("visibilitychange")); });
  check("glance: moves on to Sunday when the app returns", await glanceOnPage(p), ["Today is Sunday, October 11"].concat(glanceOf(adam, new Date(2026, 9, 11))));
  check("cards: Tomorrow moves to Monday", await p.$$eval(".shift .when", function (w) { return w.map(function (x) { return x.closest(".shift").querySelector("h2").firstChild.textContent + " " + x.textContent; }); }), ["Monday Tomorrow"]);
  await p.context().close();

  /* ------------------------------------------------------- settings */
  p = await page({ settings: "﻿Setting,Value\r\nWork Study Manager,Jordan Lee\r\nStudent Kitchen Manager,Mei\r\nTimesheet portal link,https://example.edu/hours/\r\n" });
  await p.goto(BASE + "#callout"); await ready(p); await p.waitForTimeout(150);
  check("settings: contacts", await text(p, "#contacts"), "STUDENT KITCHEN MANAGER Mei WORK STUDY MANAGER Jordan Lee");
  await p.goto(BASE + "#timesheet"); await ready(p); await p.waitForTimeout(150);
  check("settings: portal", [await p.getAttribute(".portal", "href"), await text(p, ".portal-url")], ["https://example.edu/hours/", "example.edu/hours"]);
  await p.goto(BASE + "#availability"); await ready(p); await p.evaluate(function () { localStorage.setItem("kitchen.me", "Beth"); }); await p.reload(); await ready(p); await p.waitForTimeout(150);
  check("settings: My availability line", await text(p, "#avail-body .note:last-child"), "Something here wrong or out of date? Send an email to the Student Kitchen Manager (Mei).");
  await p.context().close();
  p = await page({ settings: "Setting,Value\nStudent Kitchen Manager,\nTimesheet portal link,drbu.edu\n" });
  await p.goto(BASE); await ready(p); await p.waitForTimeout(150);
  var foot = await text(p, "#data-status");
  truthy("settings problems in footer", /Check settings\.csv: .*is empty.*should start with https:\/\/.*Work Study Manager" row is missing/.test(foot));
  await p.context().close();
  p = await page({ settings: 404 });
  await p.goto(BASE + "#callout"); await ready(p); await p.waitForTimeout(150);
  check("settings missing: defaults", await text(p, "#contacts"), "STUDENT KITCHEN MANAGER Art WORK STUDY MANAGER Nahelia");
  truthy("settings missing: footer says so", /couldn't be read/.test(await text(p, "#data-status")));
  await p.context().close();

  /* ----------------------------------------------------- data problems */
  p = await page({ data: 404 });
  await p.goto(BASE); await p.waitForTimeout(400);
  truthy("data missing: message", /The shift list didn't load\..*answered 404.*Close the app and open it again.*Student Kitchen Manager/.test(await text(p, "#shifts-body")));
  check("data missing: picker disabled, footer", [await p.$eval("#me", function (e) { return e.disabled; }), await text(p, "#data-status")], [true, "Shift list: not loaded."]);
  await p.context().close();
  var badShifts = "Student,Shift day,Role\nAnn,Monday,Lunch Monitor\nAnn,Tuesday,Pots & Pans\nDan,Wednesday,Pots & Pans\nDan,Thursday,Pots & Pans\n";
  var badStudents = "Student,Gender,Only does,Trained for\nAnn,F,,Lunch Monitor\nDan,M,,\n";
  p = await page({ data: badShifts, students: badStudents });
  await p.goto(BASE); await ready(p); await p.selectOption("#me", "Ann");
  check("empty cover list message", await p.$eval(".shift:first-of-type .cover-lead", function (e) { return e.textContent; }), "No one is listed to cover this shift yet.");
  check("data problems: footer clean when valid", /Check the shift files/.test(await text(p, "#data-status")), false);
  await p.context().close();
  p = await page({ data: badShifts.replace("Ann,Monday,Lunch Monitor", "Ann,Monday,Buckets & Composting").replace("Dan,Thursday,Pots & Pans", "Dan,Thursday,Buckets & Composting"), students: badStudents });
  await p.goto(BASE); await ready(p);
  truthy("data problems: footer warns", /Check the shift files: shifts\.csv line 5: Dan can't do Buckets & Composting/.test(await text(p, "#data-status")));
  await p.context().close();

  /* ----------------------------------------------------- appearance */
  p = await page();
  await p.clock.install({ time: new Date("2026-10-05T18:59:30") });
  await p.goto(BASE); await ready(p);
  function theme() { return p.evaluate(function () { var b = [].filter.call(document.querySelectorAll("[data-theme-btn]"), function (x) { return x.offsetParent; }); return [b.length, b[0].dataset.mode, document.documentElement.dataset.theme, document.querySelector("meta[name=theme-color]").content]; }); }
  check("auto before 7 pm", await theme(), [1, "auto", "light", "#ffffff"]);
  await p.clock.runFor(61000);
  check("auto turns dark at 7 pm", await theme(), [1, "auto", "dark", "#1b2028"]);
  var visBtn = "[data-theme-btn]:visible";
  await p.locator(visBtn).first().click(); check("tap: light", await theme(), [1, "light", "light", "#ffffff"]);
  await p.locator(visBtn).first().click(); check("tap: dark", await theme(), [1, "dark", "dark", "#1b2028"]);
  await p.reload(); await ready(p); check("dark remembered", await theme(), [1, "dark", "dark", "#1b2028"]);
  await p.locator(visBtn).first().click(); check("tap: back to auto", [await theme(), await p.evaluate(function () { return localStorage.getItem("kitchen.theme"); })], [[1, "auto", "dark", "#1b2028"], null]);
  check("button label", await p.locator(visBtn).first().getAttribute("aria-label"), "Appearance: Auto (dark 7 pm to 7 am). Tap for Light.");
  await p.context().close();

  /* ------------------------------------------------- install as app */
  p = await page();
  await p.goto(BASE); await ready(p);
  await p.click("#install-btn");
  check("install help elsewhere", await text(p, "#install-help"), "Open your browser's menu and choose Install app or Add to Home screen.");
  await p.evaluate(function () {
    var e = new Event("beforeinstallprompt"); window.__prompted = 0;
    e.prompt = function () { window.__prompted++; }; e.userChoice = Promise.resolve({ outcome: "accepted" });
    window.dispatchEvent(e);
  });
  await p.click("#install-btn");
  check("install uses the browser prompt", await p.evaluate(function () { return window.__prompted; }), 1);
  await p.evaluate(function () { window.dispatchEvent(new Event("appinstalled")); });
  check("installed: button hidden", await p.$eval("#install", function (e) { return e.hidden; }), true);
  await p.context().close();
  p = await page({ ctx: { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1" } });
  await p.goto(BASE); await ready(p); await p.click("#install-btn");
  check("install help on iPhone", await text(p, "#install-help"), "In Safari, tap the Share button, then Add to Home Screen.");
  await p.context().close();
  p = await page({ init: function () { var mm = window.matchMedia; window.matchMedia = function (q) { return q === "(display-mode: standalone)" ? { matches: true } : mm.call(window, q); }; } });
  await p.goto(BASE); await ready(p);
  check("running installed: no install button", await p.$eval("#install", function (e) { return e.hidden; }), true);
  await p.context().close();
  p = await page();
  await p.goto("file://" + path.join(ROOT, "index.html")); await p.waitForTimeout(500);
  truthy("file:// explains", /Open the app from its web address/.test(await text(p, "#shifts-body")));
  check("file:// hides install", await p.$eval("#install", function (e) { return e.hidden; }), true);
  await p.context().close();

  /* ---------------------------------------------- layout, both modes */
  for (var v of [[320, 640], [375, 780], [1280, 900]]) {
    for (var mode of ["light", "dark"]) {
      p = await page({ ctx: { viewport: { width: v[0], height: v[1] } }, init: new Function("try{localStorage.setItem('kitchen.theme','" + mode + "');localStorage.setItem('kitchen.me','Aryashree')}catch(e){}"), time: "2026-10-04T10:00:00" });
      for (var tab of ["", "#callout", "#availability", "#timesheet"]) {
        await p.goto(BASE + tab); await ready(p); await p.waitForTimeout(100);
        var m = await p.evaluate(function () {
          var s = document.getElementById("scroll"), nav = document.querySelector(innerWidth >= 820 ? ".topbar" : ".bottomnav").getBoundingClientRect();
          var items = [].map.call(document.querySelectorAll(innerWidth >= 820 ? ".nav-item" : ".bn-item"), function (a) { return Math.round(a.getBoundingClientRect().height); });
          return { sideways: s.scrollWidth - s.clientWidth, navInView: nav.top >= 0 && nav.bottom <= innerHeight + 0.5, oneLine: Math.max.apply(null, items) - Math.min.apply(null, items) };
        });
        check("layout " + v[0] + " " + mode + " " + (tab || "#shifts"), m, { sideways: 0, navInView: true, oneLine: 0 });
        if (!tab) check("layout " + v[0] + " " + mode + ": the name pill sits beside the heading, and the list covers it", await p.evaluate(function () {
          var h = document.querySelector(".title h1").getBoundingClientRect(), pill = document.getElementById("me-pill").getBoundingClientRect(), sel = document.getElementById("me").getBoundingClientRect();
          return [pill.left > h.right, pill.top < h.bottom && pill.bottom > h.top, Math.round(sel.width) === Math.round(pill.width) && Math.round(sel.height) === Math.round(pill.height)];
        }), [true, true, true]);
      }
      await p.context().close();
    }
  }

  /* ------------------------------------ offline, and self-updating */
  var tmp = fs.mkdtempSync(path.join(os.tmpdir(), "kitchen-"));
  ["index.html", "sw.js", "settings.csv", "shifts.csv", "students.csv", "roles.csv", "manifest.webmanifest"].forEach(function (f) { fs.copyFileSync(path.join(ROOT, f), path.join(tmp, f)); });
  ["fonts", "icons"].forEach(function (d) { fs.cpSync(path.join(ROOT, d), path.join(tmp, d), { recursive: true }); });
  var server2 = await serve(tmp, PORT + 1), BASE2 = "http://localhost:" + (PORT + 1) + "/";
  var ctx = await browser.newContext({ viewport: { width: 375, height: 780 } });
  p = await ctx.newPage(); p.on("pageerror", function (e) { errors.push(e.message); });
  await p.goto(BASE2); await ready(p);
  await p.evaluate(function () { return navigator.serviceWorker.ready; });
  var version = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8").match(/CACHE = "([^"]+)"/)[1];
  check("service worker cache", await p.evaluate(function () { return caches.keys(); }), [version]);
  await p.reload(); await ready(p);
  await ctx.setOffline(true);
  await p.reload(); await ready(p);
  check("works offline", [await text(p, "#data-status"), (await p.$$eval("#me option", function (o) { return o.length; })) - 1], ["Shift list: 17 students, 41 shifts a week.", 17]);
  await ctx.setOffline(false);
  fs.writeFileSync(path.join(tmp, "sw.js"), fs.readFileSync(path.join(tmp, "sw.js"), "utf8").replace(/CACHE = "[^"]+"/, 'CACHE = "kitchen-test-next"'));
  var reloaded = false;
  p.on("framenavigated", function (f) { if (f === p.mainFrame()) reloaded = true; });
  await p.evaluate(function () { return navigator.serviceWorker.getRegistration().then(function (r) { return r.update(); }); });
  for (var i = 0; i < 75 && !reloaded; i++) await p.waitForTimeout(200);   // up to 15 s: a busy machine can be slow
  check("an update reloads the open page by itself", reloaded, true);
  await ready(p);
  check("old cache dropped", await p.evaluate(function () { return caches.keys(); }), ["kitchen-test-next"]);
  await ctx.close();
  server2.kill(); fs.rmSync(tmp, { recursive: true, force: true });

  check("no page errors", errors, []);
  await browser.close(); server.kill();
  console.log(passed + " passed, " + failed + " failed");
  process.exit(failed ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(1); });
