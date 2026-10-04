/* Kitchen Cleanup: the shift-list functions, shared by the app
   (index.html) and the cover-list maker (make-cover-lists.html). Plain ES5,
   no DOM, so tests/data.test.js can run it on its own.

   Everything is on one object, KC:
     parseCSV(text)        CSV text -> rows of strings
     dayIndex(text)        "Monday" / "mon" -> 0 … 6, or -1
     womenOnly(role)       true for Buckets & Composting
     buildData(text)       the app's reading of shift_cover_list.csv
     readSchedule(text)    any CSV with Student, Gender, Shift day, Role
     checkSchedule(rows)   problems that stop or deserve a look
     makeCoverLists(rows)  every shift with its cover list, by the rules
     toCSV(shifts)         the finished shift_cover_list.csv text */
var KC = (function () {
  "use strict";
  var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var DATA_FILE = "shift_cover_list.csv";
  var HEADER = ["Student", "Gender", "Shift day", "Role", "# who can cover", "Can be asked to cover (fewest shifts first)"];

  function parseCSV(text) {
    text = text.replace(/^\uFEFF/, "");
    var rows = [], row = [], f = "", q = false, i, c;
    for (i = 0; i < text.length; i++) {
      c = text.charAt(i);
      if (q) {
        if (c === '"') { if (text.charAt(i + 1) === '"') { f += '"'; i++; } else q = false; }
        else f += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(f); f = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text.charAt(i + 1) === "\n") i++;
        row.push(f); rows.push(row); row = []; f = "";
      } else f += c;
    }
    if (f !== "" || row.length) { row.push(f); rows.push(row); }
    return rows.filter(function (r) { return r.join("").replace(/\s/g, "") !== ""; });
  }

  function dayIndex(s) {
    s = (s || "").trim().toLowerCase().slice(0, 3);
    for (var i = 0; i < DAYS.length; i++) if (DAYS[i].toLowerCase().slice(0, 3) === s) return i;
    return -1;
  }

  /* Buckets & Composting is for women only. */
  function womenOnly(role) { return /bucket/i.test(role); }

  /* One row per shift: Student, Gender, Shift day, Role, # who can cover,
     and the names who can be asked to cover, in the order to ask them. The
     cover list is used exactly as written; the checks below only report
     problems in the footer, for whoever keeps the file. Gender (F or M) is
     never shown; it is only checked against Buckets & Composting. */
  function buildData(text) {
    var rows = parseCSV(text), out = { shifts: [], names: [], problems: [] };
    if (!rows.length) { out.problems.push(DATA_FILE + " is empty."); return out; }
    var head = rows[0].map(function (h) { return h.trim().toLowerCase(); });
    function col(test) { for (var i = 0; i < head.length; i++) if (test(head[i])) return i; return -1; }
    var cS = col(function (h) { return h === "student" || h === "name"; }),
        cG = col(function (h) { return h === "gender"; }),
        cD = col(function (h) { return h.indexOf("day") >= 0; }),
        cR = col(function (h) { return h === "role"; }),
        cN = col(function (h) { return h.charAt(0) === "#"; }),
        cC = col(function (h) { return h.indexOf("can be asked") === 0 || h.indexOf("cover (") >= 0; });
    if (cS < 0 || cD < 0 || cC < 0) { out.problems.push(DATA_FILE + " needs Student, Shift day and cover columns."); return out; }
    if (cG < 0) out.problems.push("Add a Gender column (F or M) so Buckets & Composting lists can be checked.");
    /* null-prototype maps, so a name like "constructor" is just a name */
    var seen = Object.create(null), count = Object.create(null), gender = Object.create(null), works = Object.create(null);
    rows.slice(1).forEach(function (r, n) {
      var who = (r[cS] || "").trim(), d = dayIndex(r[cD]), line = n + 2;
      if (!who) { out.problems.push("Line " + line + " has no student."); return; }
      if (d < 0) { out.problems.push("Line " + line + ": \"" + (r[cD] || "") + "\" isn't a day."); return; }
      if (seen[who + "|" + d]) { out.problems.push(who + " is listed twice on " + DAYS[d] + "."); return; }
      seen[who + "|" + d] = true;
      if (cG >= 0) {
        var g = (r[cG] || "").trim().toUpperCase().charAt(0);
        if (g !== "F" && g !== "M") out.problems.push("Line " + line + ": " + who + "'s gender should be F or M.");
        else if (gender[who] && gender[who] !== g) out.problems.push(who + " is marked " + gender[who] + " on one row and " + g + " on another.");
        else gender[who] = g;
      }
      var cover = (r[cC] || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean);
      var stated = cN >= 0 ? parseInt(r[cN], 10) : NaN;
      if (!isNaN(stated) && stated !== cover.length) out.problems.push(who + " (" + DAYS[d] + ") says " + stated + " can cover but lists " + cover.length + ".");
      count[who] = (count[who] || 0) + 1;
      works[who + "|" + d] = true;
      out.shifts.push({ who: who, day: d, role: cR >= 0 ? (r[cR] || "").trim() : "", cover: cover });
    });
    out.names = Object.keys(count).sort(function (a, b) { return a.localeCompare(b); });
    out.names.forEach(function (n) {
      if (count[n] < 2 || count[n] > 4) out.problems.push(n + " has " + count[n] + " shift" + (count[n] === 1 ? "" : "s") + " (expected 2 to 4).");
    });
    out.shifts.forEach(function (s) {
      var where = s.who + "'s " + DAYS[s.day] + " cover list";
      if (womenOnly(s.role) && gender[s.who] === "M") out.problems.push(s.who + " is on Buckets & Composting on " + DAYS[s.day] + ", which is for women only.");
      s.cover.forEach(function (c) {
        if (!count[c]) out.problems.push("\"" + c + "\" (in " + where + ") isn't a student on the list.");
        else if (c === s.who) out.problems.push(where + " includes " + c + ".");
        else if (works[c + "|" + s.day]) out.problems.push(c + " is in " + where + " but also works on " + DAYS[s.day] + ".");
        else if (womenOnly(s.role) && gender[c] === "M") out.problems.push(c + " is in " + where + ", but Buckets & Composting is for women only.");
      });
    });
    return out;
  }


  /* ------------------------------------------------- the cover-list maker */

  /* The columns the maker needs from any spreadsheet. Other columns,
     such as old cover lists, are ignored. */
  function readSchedule(text) {
    var rows = parseCSV(text), out = { rows: [], problems: [] };
    if (!rows.length) { out.problems.push({ level: "error", text: "The file is empty." }); return out; }
    var head = rows[0].map(function (h) { return h.trim().toLowerCase(); });
    function col(test) { for (var i = 0; i < head.length; i++) if (test(head[i])) return i; return -1; }
    var cS = col(function (h) { return h === "student" || h === "name"; }),
        cG = col(function (h) { return h === "gender"; }),
        cD = col(function (h) { return h.indexOf("day") >= 0; }),
        cR = col(function (h) { return h === "role"; });
    var missing = [];
    if (cS < 0) missing.push("Student");
    if (cG < 0) missing.push("Gender");
    if (cD < 0) missing.push("Shift day");
    if (cR < 0) missing.push("Role");
    if (missing.length) { out.problems.push({ level: "error", text: "The file needs these columns: " + missing.join(", ") + "." }); return out; }
    rows.slice(1).forEach(function (r) {
      var d = dayIndex(r[cD]);
      out.rows.push({
        who: (r[cS] || "").trim(),
        gender: normGender(r[cG]),
        day: d < 0 ? (r[cD] || "").trim() : DAYS[d],
        role: (r[cR] || "").trim()
      });
    });
    return out;
  }

  function normGender(g) {
    g = (g || "").trim().toUpperCase().charAt(0);
    return g === "F" || g === "M" ? g : (g ? "?" : "");
  }

  /* Problems with a schedule. "error" stops the maker; "warn" doesn't. */
  function checkSchedule(rows) {
    var problems = [], seen = Object.create(null), gender = Object.create(null), count = Object.create(null), leaders = Object.create(null);
    function err(t) { problems.push({ level: "error", text: t }); }
    function warn(t) { problems.push({ level: "warn", text: t }); }
    if (!rows.length) err("Add at least one shift.");
    rows.forEach(function (r, i) {
      var n = "Row " + (i + 1), d = dayIndex(r.day), g = normGender(r.gender);
      if (!r.who) { err(n + ": add the student's name."); return; }
      if (d < 0) { err(n + " (" + r.who + "): " + (r.day ? "\"" + r.day + "\" isn't a day." : "choose a day.")); return; }
      if (!r.role) err(n + " (" + r.who + "): choose a role.");
      if (g !== "F" && g !== "M") err(n + " (" + r.who + "): gender should be F or M.");
      else if (gender[r.who] && gender[r.who] !== g) err(r.who + " is marked " + gender[r.who] + " on one row and " + g + " on another.");
      else gender[r.who] = g;
      if (seen[r.who + "|" + d]) { err(r.who + " is on " + DAYS[d] + " twice."); return; }
      seen[r.who + "|" + d] = true;
      count[r.who] = (count[r.who] || 0) + 1;
      if (womenOnly(r.role) && g === "M") err(r.who + " is on Buckets & Composting on " + DAYS[d] + ", which is for women only.");
      if (/leader/i.test(r.role)) (leaders[d] = leaders[d] || []).push(r.who);
      leaders[d] = leaders[d] || [];
    });
    Object.keys(count).sort(function (a, b) { return a.localeCompare(b); }).forEach(function (n) {
      if (count[n] < 2 || count[n] > 4) warn(n + " has " + count[n] + " shift" + (count[n] === 1 ? "" : "s") + " (usually 2 to 4).");
    });
    Object.keys(leaders).map(Number).sort().forEach(function (d) {
      if (!leaders[d].length) warn(DAYS[d] + " has no Shift Leader.");
      else if (leaders[d].length > 1) warn(DAYS[d] + " has " + leaders[d].length + " Shift Leaders: " + leaders[d].join(", ") + ".");
    });
    return problems;
  }

  /* Every shift with its cover list. For each shift: everyone not working
     that day, fewest shifts first, ties in alphabetical order; for Buckets
     & Composting (women only), women only. Shifts come out by student, then
     by day. Run it only on a schedule with no errors. */
  function makeCoverLists(rows) {
    var count = Object.create(null), gender = Object.create(null), works = Object.create(null);
    rows.forEach(function (r) {
      count[r.who] = (count[r.who] || 0) + 1;
      gender[r.who] = normGender(r.gender);
      works[r.who + "|" + dayIndex(r.day)] = true;
    });
    var names = Object.keys(count).sort(function (a, b) { return count[a] - count[b] || a.localeCompare(b); });
    return rows.slice().sort(function (a, b) {
      return a.who.localeCompare(b.who) || dayIndex(a.day) - dayIndex(b.day);
    }).map(function (r) {
      var d = dayIndex(r.day), women = womenOnly(r.role);
      return {
        who: r.who, gender: gender[r.who], day: DAYS[d], role: r.role,
        cover: names.filter(function (n) { return !works[n + "|" + d] && (!women || gender[n] === "F"); })
      };
    });
  }

  /* CSV the way spreadsheets write it: a byte-order mark (so Excel reads
     the text correctly), Windows line ends, and quotes only where needed. */
  function toCSV(shifts) {
    function cell(v) { v = String(v); return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
    var lines = [HEADER.map(cell).join(",")].concat(shifts.map(function (s) {
      return [s.who, s.gender, s.day, s.role, s.cover.length, s.cover.join(", ")].map(cell).join(",");
    }));
    return "\uFEFF" + lines.join("\r\n") + "\r\n";
  }

  return {
    DAYS: DAYS, DATA_FILE: DATA_FILE, HEADER: HEADER,
    parseCSV: parseCSV, dayIndex: dayIndex, womenOnly: womenOnly, buildData: buildData,
    readSchedule: readSchedule, checkSchedule: checkSchedule, makeCoverLists: makeCoverLists, toCSV: toCSV
  };
})();
