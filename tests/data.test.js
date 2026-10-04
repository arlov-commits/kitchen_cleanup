/* Checks for the data functions in index.html: node tests/data.test.js
   Each function is lifted out of index.html by name and run on its own, so
   these tests always exercise the code the app actually ships. */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var root = path.join(__dirname, "..");
var html = fs.readFileSync(path.join(root, "index.html"), "utf8");

/* the source of "function NAME(...) { ... }", by matching braces */
function lift(name) {
  var start = html.indexOf("function " + name + "(");
  if (start < 0) throw new Error("index.html has no function " + name);
  var i = html.indexOf("{", start), depth = 0;
  for (; i < html.length; i++) {
    if (html[i] === "{") depth++;
    else if (html[i] === "}" && --depth === 0) return html.slice(start, i + 1);
  }
  throw new Error("unbalanced " + name);
}

function sandbox() {
  var box = {
    DAYS: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    DATA_FILE: "shift_cover_list.csv",
    CONFIG: { contacts: [{ role: "Student Kitchen Manager", name: "Art" }, { role: "Work Study Manager", name: "Nahelia" }],
              portal: "https://www.drbu.edu/timesheet" },
    settingsProblems: []
  };
  vm.createContext(box);
  ["esc", "parseCSV", "dayIndex", "womenOnly", "buildData", "roleRank", "applySettings", "dateKey"].forEach(function (n) {
    vm.runInContext(lift(n), box);
  });
  return box;
}

var passed = 0, failed = 0;
function check(label, got, want) {
  var g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) passed++;
  else { failed++; console.log("FAIL " + label + "\n  got  " + g + "\n  want " + w); }
}
function has(label, list, piece) {
  if (list.some(function (p) { return p.indexOf(piece) >= 0; })) passed++;
  else { failed++; console.log("FAIL " + label + ": no problem containing " + JSON.stringify(piece) + "\n  " + JSON.stringify(list)); }
}
var H = "Student,Gender,Shift day,Role,# who can cover,Can be asked to cover (fewest shifts first)\n";
function data(body) { return sandbox().buildData(H + body); }

/* --------------------------------------------------------------- esc */
var b = sandbox();
check("esc", b.esc("<a href=\"x\">Tom & 'Jo'</a>"), "&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jo&#39;&lt;/a&gt;");
check("esc number", b.esc(8), "8");

/* ---------------------------------------------------------- parseCSV */
check("csv basic", b.parseCSV("a,b\n1,2"), [["a", "b"], ["1", "2"]]);
check("csv BOM + CRLF", b.parseCSV("﻿a,b\r\n1,2\r\n"), [["a", "b"], ["1", "2"]]);
check("csv quoted comma", b.parseCSV('n,list\nx,"A, B, C"'), [["n", "list"], ["x", "A, B, C"]]);
check("csv doubled quote", b.parseCSV('a\n"say ""hi"""'), [["a"], ['say "hi"']]);
check("csv newline in quotes", b.parseCSV('a,b\n"one\ntwo",3'), [["a", "b"], ["one\ntwo", "3"]]);
check("csv blank and comma-only rows dropped", b.parseCSV("a,b\n\n,,\n  \n1,2\n"), [["a", "b"], ["1", "2"]]);
check("csv lone CR line ends", b.parseCSV("a\rb"), [["a"], ["b"]]);
check("csv empty", b.parseCSV(""), []);

/* ---------------------------------------------------------- dayIndex */
check("day full", b.dayIndex("Monday"), 0);
check("day short + case + space", b.dayIndex("  TUE "), 1);
check("day Thurs", b.dayIndex("Thurs"), 3);
check("day Sunday", b.dayIndex("Sunday"), 6);
check("day bad", b.dayIndex("Funday"), -1);
check("day empty", b.dayIndex(""), -1);
check("day undefined", b.dayIndex(undefined), -1);

/* ---------------------------------------------------- roles / gender */
check("rank leader", b.roleRank("Shift Leader"), 0);
check("rank pots", b.roleRank("Pots & Pans"), 1);
check("rank buckets", b.roleRank("Buckets & Composting"), 2);
check("rank blank", b.roleRank(""), 1);
check("women only", [b.womenOnly("Buckets & Composting"), b.womenOnly("Pots & Pans")], [true, false]);

/* ------------------------------------------------ the shipped file */
var real = sandbox().buildData(fs.readFileSync(path.join(root, "shift_cover_list.csv"), "utf8"));
check("real: no problems", real.problems, []);
check("real: students", real.names.length, 14);
check("real: shifts", real.shifts.length, 30);
check("real: nobody still says Student Leader", real.shifts.filter(function (s) { return /student leader/i.test(s.role); }).length, 0);
check("real: one Shift Leader a day", [0, 1, 2, 3, 4].map(function (d) {
  return real.shifts.filter(function (s) { return s.day === d && s.role === "Shift Leader"; }).length;
}), [1, 1, 1, 1, 1]);
var amelia = real.shifts.filter(function (s) { return s.who === "Amelia"; });
check("real: Amelia renamed", amelia.map(function (s) { return s.day; }), [0, 3]);
check("real: cover order kept as written", real.shifts[0].cover, ["Adrian", "Beth", "Irina", "Lavanya", "Priya", "Roxanne", "Tsering", "Vayu"]);

/* ------------------------------------------------- shift-list checks */
var ok = "Ann,F,Monday,Pots & Pans,1,Bea\nAnn,F,Tuesday,Pots & Pans,1,Bea\nBea,F,Wednesday,Pots & Pans,1,Ann\nBea,F,Thursday,Pots & Pans,1,Ann\n";
check("small clean file", data(ok).problems, []);
check("missing columns", sandbox().buildData("Name,Day\nAnn,Monday").problems, ["shift_cover_list.csv needs Student, Shift day and cover columns."]);
check("empty file", sandbox().buildData("").problems, ["shift_cover_list.csv is empty."]);
has("no Gender column", sandbox().buildData("Student,Shift day,Role,Can be asked to cover (fewest shifts first)\nAnn,Monday,Pots & Pans,\nAnn,Tuesday,Pots & Pans,\n").problems, "Add a Gender column");
has("gender not F/M", data(ok.replace("Ann,F,Monday", "Ann,X,Monday")).problems, "Ann's gender should be F or M");
check("gender words accepted", data(ok.replace(/,F,/g, ",female,")).problems, []);
has("gender disagrees", data(ok.replace("Ann,F,Tuesday", "Ann,M,Tuesday")).problems, "Ann is marked F on one row and M on another");
has("bad day", data(ok + "Cy,F,Funday,Pots & Pans,0,\n").problems, "\"Funday\" isn't a day");
has("no student", data(ok + ",F,Friday,Pots & Pans,0,\n").problems, "has no student");
var dup = data(ok + "Ann,F,Monday,Pots & Pans,1,Bea\n");
has("duplicate row", dup.problems, "Ann is listed twice on Monday");
check("duplicate row skipped", dup.shifts.length, 4);
has("count mismatch", data(ok.replace("Monday,Pots & Pans,1,Bea", "Monday,Pots & Pans,3,Bea")).problems, "says 3 can cover but lists 1");
has("too few shifts", data(ok + "Cy,F,Friday,Pots & Pans,0,\n").problems, "Cy has 1 shift (expected 2 to 4)");
has("unknown cover name", data(ok.replace("Monday,Pots & Pans,1,Bea", "Monday,Pots & Pans,1,Bee")).problems, "\"Bee\" (in Ann's Monday cover list) isn't a student");
has("own name in list", data(ok.replace("Monday,Pots & Pans,1,Bea", "Monday,Pots & Pans,1,Ann")).problems, "Ann's Monday cover list includes Ann");
has("cover works that day", data(ok + "Cy,F,Monday,Pots & Pans,0,\nCy,F,Friday,Pots & Pans,1,Ann\n").problems.concat(
    data(ok.replace("Monday,Pots & Pans,1,Bea", "Monday,Pots & Pans,2,\"Bea, Cy\"") + "Cy,F,Monday,Pots & Pans,0,\nCy,F,Friday,Pots & Pans,0,\n").problems),
  "Cy is in Ann's Monday cover list but also works on Monday");
var men = "Ann,F,Monday,Buckets & Composting,1,Dan\nAnn,F,Tuesday,Pots & Pans,1,Dan\nDan,M,Wednesday,Pots & Pans,1,Ann\nDan,M,Thursday,Buckets & Composting,1,Ann\n";
var mp = data(men).problems;
has("man in a Buckets cover list", mp, "Dan is in Ann's Monday cover list, but Buckets & Composting is for women only");
has("man on a Buckets shift", mp, "Dan is on Buckets & Composting on Thursday, which is for women only");
check("man on Pots & Pans is fine", mp.filter(function (p) { return p.indexOf("Tuesday") >= 0; }), []);
var proto = data("constructor,F,Monday,Pots & Pans,1,toString\nconstructor,F,Tuesday,Pots & Pans,0,\n");
has("names like constructor are plain names", proto.problems, "\"toString\" (in constructor's Monday cover list) isn't a student");
check("constructor counted", proto.names, ["constructor"]);
check("names sorted", data("Zoe,F,Monday,Pots & Pans,0,\nZoe,F,Tuesday,Pots & Pans,0,\nAmy,F,Friday,Pots & Pans,0,\nAmy,F,Thursday,Pots & Pans,0,\n").names, ["Amy", "Zoe"]);
check("blank cover list allowed", data("Amy,F,Monday,Pots & Pans,0,\nAmy,F,Tuesday,Pots & Pans,0,\n").shifts[0].cover, []);

/* ------------------------------------------------------ applySettings */
function settings(text) { var s = sandbox(); s.applySettings(text); return s; }
var st = settings("Setting,Value\nStudent Kitchen Manager,Mei\nWork Study Manager,Jordan Lee\nTimesheet portal link,https://example.edu/hours\n");
check("settings applied", [st.CONFIG.contacts[0].name, st.CONFIG.contacts[1].name, st.CONFIG.portal], ["Mei", "Jordan Lee", "https://example.edu/hours"]);
check("settings clean", st.settingsProblems, []);
st = settings("﻿Timesheet portal link,http://x.edu/t\r\nwork study manager,Kim\r\nStudent Kitchen Manager,Art\r\n");
check("no header, any order, any case, http ok", [st.CONFIG.contacts[1].name, st.CONFIG.portal, st.settingsProblems], ["Kim", "http://x.edu/t", []]);
st = settings("Setting,Value\nStudent Kitchen Manager,\nWork Study Manager,Kim\nWork Study Manager,Lee\nTimesheet portal link,www.drbu.edu/timesheet\nKitchen Mgr,Bob\n");
has("settings empty name", st.settingsProblems, "Student Kitchen Manager is empty");
has("settings duplicate", st.settingsProblems, "\"Work Study Manager\" is listed twice");
has("settings bad link", st.settingsProblems, "should start with https://");
has("settings unknown row", st.settingsProblems, "\"Kitchen Mgr\" isn't a setting");
check("settings keep defaults on bad values", [st.CONFIG.contacts[0].name, st.CONFIG.portal], ["Art", "https://www.drbu.edu/timesheet"]);
check("settings last duplicate wins", st.CONFIG.contacts[1].name, "Lee");
has("settings missing row", settings("Setting,Value\nStudent Kitchen Manager,Art\n").settingsProblems, "\"Timesheet Portal Link\" row is missing");
st = settings("Setting,Value\nTimesheet portal link,javascript:alert(1)\nStudent Kitchen Manager,Art\nWork Study Manager,N\n");
check("settings refuse a non-web link", st.CONFIG.portal, "https://www.drbu.edu/timesheet");
var shipped = settings(fs.readFileSync(path.join(root, "settings.csv"), "utf8"));
check("shipped settings clean", shipped.settingsProblems, []);

/* ----------------------------------------------------------- dateKey */
check("dateKey", b.dateKey(new Date(2026, 9, 4)), "2026-10-4");

console.log(passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
