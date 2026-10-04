/* Checks for the data functions in index.html: node tests/data.test.js
   Each function is lifted out of index.html by name and run on its own, so
   these tests always exercise the code the app actually ships.

   tests/expected-cover-lists.csv is the reference: every shift's cover
   list, written by tests/expected_cover_lists.py, a second implementation
   of the rules in Python. The app's JavaScript must give exactly the same
   lists from shifts.csv, students.csv and roles.csv. */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var root = path.join(__dirname, "..");
var html = fs.readFileSync(path.join(root, "index.html"), "utf8");
function read(f) { return fs.readFileSync(path.join(root, f), "utf8"); }

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
    FILES: { shifts: "shifts.csv", students: "students.csv", roles: "roles.csv" },
    CONFIG: { contacts: [{ role: "Student Kitchen Manager", name: "Art" }, { role: "Work Study Manager", name: "Nahelia" }],
              portal: "https://www.drbu.edu/timesheet" },
    settingsProblems: [], data: null
  };
  vm.createContext(box);
  ["esc", "parseCSV", "dayIndex", "lower", "header", "cell", "list", "personGender", "roleGender", "yes",
   "readRoles", "readStudents", "canDo", "buildData", "roleRank", "applySettings", "dateKey"].forEach(function (n) {
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
var b = sandbox();
var SHIFTS = read("shifts.csv"), STUDENTS = read("students.csv"), ROLES = read("roles.csv");
/* null means "the shipped file" */
function build(shifts, students, roles) { return sandbox().buildData(shifts != null ? shifts : SHIFTS, students != null ? students : STUDENTS, roles != null ? roles : ROLES); }
function shiftOf(d, who, day) { return d.shifts.filter(function (x) { return x.who === who && b.DAYS[x.day] === day; })[0]; }
function coverOf(d, who, day) { var s = shiftOf(d, who, day); return s ? s.cover : null; }
/* swap one piece of a CSV for another */
function edit(text, from, to) { if (text.indexOf(from) < 0) throw new Error("no " + from); return text.replace(from, to); }
var MEN = /^(Adam|Adrian|Vayu|Ben Kong)$/;

/* --------------------------------------------------------------- esc */
check("esc", b.esc("<a href=\"x\">Tom & 'Jo'</a>"), "&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jo&#39;&lt;/a&gt;");

/* ---------------------------------------------------------- parseCSV */
check("csv basic", b.parseCSV("a,b\n1,2"), [["a", "b"], ["1", "2"]]);
check("csv BOM + CRLF", b.parseCSV("﻿a,b\r\n1,2\r\n"), [["a", "b"], ["1", "2"]]);
check("csv quoted comma", b.parseCSV('n,list\nx,"A, B, C"'), [["n", "list"], ["x", "A, B, C"]]);
check("csv doubled quote", b.parseCSV('a\n"say ""hi"""'), [["a"], ['say "hi"']]);
check("csv newline in quotes", b.parseCSV('a,b\n"one\ntwo",3'), [["a", "b"], ["one\ntwo", "3"]]);
check("csv blank and comma-only rows dropped", b.parseCSV("a,b\n\n,,\n  \n1,2\n"), [["a", "b"], ["1", "2"]]);
check("csv empty", b.parseCSV(""), []);

/* ------------------------------------------------- small helpers */
check("day names", [b.dayIndex("Monday"), b.dayIndex("  TUE "), b.dayIndex("Thurs"), b.dayIndex("Sunday"), b.dayIndex("Funday"), b.dayIndex("")], [0, 1, 3, 6, -1, -1]);
check("list splits on ; and ,", b.list(" Recycling; Lunch Monitor ,x "), ["recycling", "lunch monitor", "x"]);
check("person gender", ["F", "female", "Woman", "M", "male", "man", "x", ""].map(b.personGender), ["F", "F", "F", "M", "M", "M", "", ""]);
check("role gender", ["Any", "", "any gender", "Women only", "Female only", "F", "Men only", "Male only", "M", "nobody"].map(b.roleGender),
  ["any", "any", "any", "F", "F", "F", "M", "M", "M", null]);
check("yes", ["Yes", "y", "TRUE", "No", "", "maybe"].map(b.yes), [true, true, true, false, false, false]);

/* ---------------------------------------------- the shipped files */
var real = build();
check("shipped: no problems", real.problems, []);
check("shipped: 17 students, 41 shifts", [real.names.length, real.shifts.length], [17, 41]);
var expected = b.parseCSV(read("tests/expected-cover-lists.csv")).slice(1);
check("shipped: every cover list matches the reference", expected.filter(function (r) {
  return JSON.stringify(coverOf(real, r[0], r[1])) !== JSON.stringify(r[3] ? r[3].split(", ") : []);
}).map(function (r) { return r[0] + " " + r[1]; }), []);
check("shipped: every last resort starts where the reference says", expected.filter(function (r) {
  return shiftOf(real, r[0], r[1]).lastFrom !== +r[4];
}).map(function (r) { return r[0] + " " + r[1]; }), []);
check("shipped: the reference covers every shift", expected.length, real.shifts.length);
check("role order from roles.csv", ["Shift Leader", "Pots & Pans", "Buckets & Composting", "Recycling", "Lunch Monitor"].map(function (r) { return real.roleRank[r]; }), [0, 1, 2, 3, 4]);
check("work groups", ["Ivwananji|Monday", "Adam|Monday", "Aryashree|Monday", "Adrian|Monday", "Shuxing|Monday"].map(function (k) {
  var p = k.split("|"); return shiftOf(real, p[0], p[1]).group;
}), ["kitchen", "kitchen", "kitchen", "recycling", "lunch monitor"]);

/* the rules, one by one, on the shipped files */
check("order for a man: anyone with a shift he can take back, then the last resort (a lunch monitor, then same-day)",
  coverOf(real, "Adam", "Monday"), ["Beth", "Irina", "Lavanya", "Priya", "Roxanne", "Tsering", "Thanh", "Adrian", "Vayu", "Shuxing"]);
check("last resort starts after those he can swap with", shiftOf(real, "Adam", "Monday").lastFrom, 6);
check("swaps are shift by shift: Irina is a swap for Adam for her Pots & Pans, not her Buckets", shiftOf(real, "Adam", "Monday").swap.Irina, ["Pots & Pans"]);
check("Aryashree, Tuesday: only those with no shift she can take are last resort",
  [coverOf(real, "Aryashree", "Tuesday").slice(shiftOf(real, "Aryashree", "Tuesday").lastFrom), shiftOf(real, "Aryashree", "Tuesday").lastFrom],
  [["Shuxing", "Thanh"], 8]);
check("Aryashree can swap with Adrian for Pots & Pans, not Recycling", shiftOf(real, "Aryashree", "Tuesday").swap.Adrian, ["Pots & Pans"]);
check("and with Amelia for Pots & Pans and Buckets, not Lunch Monitor", shiftOf(real, "Aryashree", "Tuesday").swap.Amelia.slice().sort(), ["Buckets & Composting", "Pots & Pans"]);
check("Shuxing has nothing Aryashree can take", shiftOf(real, "Aryashree", "Tuesday").swap.Shuxing, []);
check("Ben Kong can swap Recycling for Recycling", [shiftOf(real, "Ben Kong", "Friday").lastFrom, shiftOf(real, "Ben Kong", "Friday").swap.Adam], [2, ["Recycling"]]);
check("a lunch monitor who can do everything a backup does swaps both ways", shiftOf(real, "Thanh", "Tuesday").lastFrom, 2);
check("no one you could swap with is ever below the last resort line", real.shifts.every(function (s) {
  return s.lastFrom >= 0 && s.lastFrom <= s.cover.length;
}), true);
check("order: same job (Buckets) before same group (Kitchen) before another group (Lunch Monitor)",
  coverOf(real, "Aryashree", "Monday"), ["Irina", "Roxanne", "Beth", "Lavanya", "Priya", "Tsering", "Thanh", "Shuxing"]);

check("Shift Leader is covered as Pots & Pans", [shiftOf(real, "Adrian", "Wednesday").as, shiftOf(real, "Adrian", "Wednesday").role], ["Pots & Pans", "Shift Leader"]);
check("Shift Leader's backups are Pots & Pans backups (same asker type)", coverOf(real, "Adrian", "Wednesday"), coverOf(real, "Vayu", "Wednesday"));
check("a Shift Leader counts as doing the Pots & Pans job", coverOf(real, "Adam", "Tuesday").indexOf("Adrian") < coverOf(real, "Adam", "Tuesday").indexOf("Shuxing"), true);
check("Recycling: men only, no same-day backups", coverOf(real, "Adam", "Thursday"), ["Adrian", "Ben Kong"]);
check("Buckets: women only; same-day Lunch Monitor last; no same-day Pots & Pans",
  coverOf(real, "Amelia", "Thursday"), ["Irina", "Nita", "Roxanne", "Ivwananji", "Priya", "Tsering", "Thanh", "Shuxing"]);
check("Lunch Monitor: only trained lunch monitors, fewest shifts first", coverOf(real, "Thanh", "Tuesday"), ["Shuxing", "Amelia"]);
check("Ben Kong only ever covers Recycling", real.shifts.filter(function (s) { return s.role !== "Recycling" && s.cover.indexOf("Ben Kong") >= 0; }).length, 0);
check("Ben Kong covers Recycling", coverOf(real, "Vayu", "Monday"), ["Ben Kong"]);
check("no one covers their own shift", real.shifts.every(function (s) { return s.cover.indexOf(s.who) < 0; }), true);
check("men never cover Buckets or Lunch Monitor", real.shifts.filter(function (s) {
  return /Buckets|Lunch/.test(s.role) && s.cover.some(function (c) { return MEN.test(c); });
}).length, 0);
check("women never cover Recycling", real.shifts.filter(function (s) {
  return s.role === "Recycling" && s.cover.some(function (c) { return !MEN.test(c); });
}).length, 0);

/* the switches in roles.csv and students.csv */
var anyRec = build(null, null, edit(ROLES, "Recycling,Recycling,,Men only,No,", "Recycling,Recycling,,Any,No,"));
check("switch: Recycling to Any lets women cover it, after those who do Recycling", coverOf(anyRec, "Adam", "Thursday").slice(0, 3), ["Adrian", "Ben Kong", "Irina"]);
check("switch: Recycling to Any adds no problems", anyRec.problems, []);
var womenRec = build(null, null, edit(ROLES, "Recycling,Recycling,,Men only,No,", "Recycling,Recycling,,Women only,No,"));
has("switch: Recycling to Women only flags the men on it", womenRec.problems, "Adam can't do Recycling");
var anyBuckets = build(null, null, edit(ROLES, "Buckets & Composting,Kitchen,,Women only,No,Lunch Monitor", "Buckets & Composting,Kitchen,,Any,No,Lunch Monitor"));
check("switch: Buckets to Any lets men cover it (Ben Kong still can't)", coverOf(anyBuckets, "Amelia", "Thursday").filter(function (c) { return MEN.test(c); }), ["Adrian"]);
var freeBen = build(null, edit(STUDENTS, "Ben Kong,M,Recycling,", "Ben Kong,M,,"));
check("switch: Ben Kong unlimited covers Pots & Pans again", coverOf(freeBen, "Adam", "Monday").indexOf("Ben Kong") >= 0, true);
var twoRoles = build(null, edit(STUDENTS, "Beth,F,,", "Beth,F,Pots & Pans; Shift Leader,"));
check("switch: limited to two roles covers those", coverOf(twoRoles, "Adam", "Monday").indexOf("Beth") >= 0, true);
check("switch: but not a third", coverOf(twoRoles, "Aryashree", "Monday").indexOf("Beth"), -1);
var untrained = build(null, null, edit(ROLES, "Lunch Monitor,Lunch Monitor,,Women only,Yes,", "Lunch Monitor,Lunch Monitor,,Women only,No,"));
check("switch: Lunch Monitor untrained opens it to all women", coverOf(untrained, "Thanh", "Tuesday").length > 2, true);
var bethTrained = build(null, edit(STUDENTS, "Beth,F,,", "Beth,F,,Lunch Monitor"));
check("switch: training a student adds them to Lunch Monitor lists", coverOf(bethTrained, "Thanh", "Tuesday").indexOf("Beth") >= 0, true);
var noSame = build(null, null, edit(ROLES, "Pots & Pans,Kitchen,,Any,No,Recycling; Lunch Monitor", "Pots & Pans,Kitchen,,Any,No,"));
check("switch: no same-day backups for Pots & Pans", coverOf(noSame, "Adam", "Monday"), ["Beth", "Irina", "Lavanya", "Priya", "Roxanne", "Tsering", "Thanh"]);
var lmFirst = build(null, null, edit(ROLES, "Pots & Pans,Kitchen,,Any,No,Recycling; Lunch Monitor", "Pots & Pans,Kitchen,,Any,No,Lunch Monitor; Recycling"));
check("switch: same-day order follows the list", coverOf(lmFirst, "Adam", "Monday").slice(-3), ["Shuxing", "Adrian", "Vayu"]);
var ownGroup = build(null, null, edit(ROLES, "Buckets & Composting,Kitchen,", "Buckets & Composting,,"));
check("switch: Buckets in its own group drops Kitchen people to the third tier", coverOf(ownGroup, "Aryashree", "Monday"), ["Irina", "Roxanne", "Beth", "Lavanya", "Priya", "Tsering", "Thanh", "Shuxing"]);
var freeBen2 = build(null, edit(STUDENTS, "Ben Kong,M,Recycling,", "Ben Kong,M,,"));
check("switch: Ben Kong unlimited can swap with Recycling men again", shiftOf(freeBen2, "Ben Kong", "Friday").lastFrom, 2);
var leaderOwn = build(null, null, edit(ROLES, "Shift Leader,Kitchen,Pots & Pans,Any,No,", "Shift Leader,Kitchen,,Any,No,"));
check("switch: Shift Leader not covered as Pots & Pans: Shift Leaders first", coverOf(leaderOwn, "Adrian", "Wednesday").slice(0, 3), ["Ivwananji", "Lavanya", "Tsering"]);
check("switch: and it has no same-day backups of its own", coverOf(leaderOwn, "Adrian", "Wednesday").indexOf("Amelia"), -1);
check("switch: a blank work group makes a role its own group", shiftOf(ownGroup, "Aryashree", "Monday").group, "buckets & composting");

/* ----------------------------------------------- the files' checks */
function probs(shifts, students, roles) { return build(shifts, students, roles).problems; }
has("roles: missing column", probs(null, null, "Role,Gender\nPots & Pans,Any\n"), "roles.csv is missing a column: group, trained, same");
has("roles: bad gender", probs(null, null, edit(ROLES, "Recycling,,Men only", "Recycling,,Nobody")), "Recycling's gender should be Any, Women only or Men only");
has("roles: covered as an unknown role", probs(null, null, edit(ROLES, "Shift Leader,Kitchen,Pots & Pans", "Shift Leader,Kitchen,Pots")), "Shift Leader is covered as \"pots\", which isn't a role");
check("roles: Covered as is optional", build(null, null, ROLES.replace(/,Covered as/, "").replace(/(\r?\n[^,\r\n]*,[^,\r\n]*),[^,\r\n]*/g, "$1")).problems, []);
has("roles: duplicate", probs(null, null, ROLES + "Recycling,Recycling,Any,No,\r\n"), "Recycling is listed twice");
has("roles: same-day names an unknown role", probs(null, null, edit(ROLES, "Recycling; Lunch Monitor", "Recycling; Lunch")), "\"lunch\", which isn't a role");
has("students: bad gender", probs(null, edit(STUDENTS, "Beth,F,", "Beth,X,")), "Beth's gender should be F or M");
has("students: duplicate", probs(null, STUDENTS + "Beth,F,,\r\n"), "Beth is listed twice");
has("students: unknown role", probs(null, edit(STUDENTS, "Ben Kong,M,Recycling,", "Ben Kong,M,Recyclng,")), "\"recyclng\" isn't a role in roles.csv");
has("students: no shifts", probs(null, STUDENTS + "Zed,M,,\r\n"), "Zed is in students.csv but has no shifts");
has("shifts: missing column", probs("Student,Day\nAdam,Monday\n"), "shifts.csv is missing a column: role");
has("shifts: empty", probs(""), "shifts.csv is empty");
has("shifts: bad day", probs(SHIFTS + "Adam,Funday,Pots & Pans\r\n"), "\"Funday\" isn't a day");
has("shifts: unknown role", probs(SHIFTS + "Beth,Friday,Mopping\r\n"), "\"Mopping\" isn't a role in roles.csv");
has("shifts: twice on a day", probs(SHIFTS + "Adam,Monday,Recycling\r\n"), "Adam is on Monday twice");
has("shifts: student not in students.csv", probs(SHIFTS + "Zed,Friday,Pots & Pans\r\nZed,Monday,Pots & Pans\r\n"), "Zed isn't in students.csv");
has("shifts: man on Buckets", probs(edit(SHIFTS, "Adam,Thursday,Recycling", "Adam,Thursday,Buckets & Composting")), "Adam can't do Buckets & Composting");
has("shifts: Ben Kong off Recycling", probs(edit(SHIFTS, "Ben Kong,Tuesday,Recycling", "Ben Kong,Tuesday,Pots & Pans")), "Ben Kong can't do Pots & Pans");
has("shifts: untrained Lunch Monitor", probs(edit(SHIFTS, "Beth,Wednesday,Pots & Pans", "Beth,Wednesday,Lunch Monitor")), "Beth can't do Lunch Monitor");
has("shifts: too few", probs(SHIFTS + "Zed,Friday,Pots & Pans\r\n", STUDENTS + "Zed,M,,\r\n"), "Zed has 1 shift (expected 2 to 4)");
check("shifts: duplicate row ignored", build(SHIFTS + "Adam,Monday,Pots & Pans\r\n").shifts.length, 41);
var ctor = build("Student,Shift day,Role\nconstructor,Monday,Pots & Pans\nconstructor,Tuesday,Pots & Pans\n", "Student,Gender,Only does,Trained for\nconstructor,F,,\n");
check("names like constructor are plain names", [ctor.problems, ctor.names], [[], ["constructor"]]);
check("roles matched in any case", build(edit(SHIFTS, "Adam,Monday,Pots & Pans", "Adam,Monday,pots & pans")).problems, []);

/* ------------------------------------------------------- roleRank */
b.data = real;
check("roleRank", [b.roleRank("Shift Leader"), b.roleRank("Lunch Monitor"), b.roleRank("Nope")], [0, 4, 99]);

/* ------------------------------------------------------ applySettings */
function settings(text) { var s = sandbox(); s.applySettings(text); return s; }
var st = settings("Setting,Value\nStudent Kitchen Manager,Mei\nWork Study Manager,Jordan Lee\nTimesheet portal link,https://example.edu/hours\n");
check("settings applied", [st.CONFIG.contacts[0].name, st.CONFIG.contacts[1].name, st.CONFIG.portal, st.settingsProblems], ["Mei", "Jordan Lee", "https://example.edu/hours", []]);
st = settings("﻿Timesheet portal link,http://x.edu/t\r\nwork study manager,Kim\r\nStudent Kitchen Manager,Art\r\n");
check("settings: no header, any order, any case", [st.CONFIG.contacts[1].name, st.CONFIG.portal, st.settingsProblems], ["Kim", "http://x.edu/t", []]);
st = settings("Setting,Value\nStudent Kitchen Manager,\nWork Study Manager,Kim\nWork Study Manager,Lee\nTimesheet portal link,www.drbu.edu/timesheet\nKitchen Mgr,Bob\n");
has("settings empty name", st.settingsProblems, "Student Kitchen Manager is empty");
has("settings duplicate", st.settingsProblems, "\"Work Study Manager\" is listed twice");
has("settings bad link", st.settingsProblems, "should start with https://");
has("settings unknown row", st.settingsProblems, "\"Kitchen Mgr\" isn't a setting");
check("settings keep defaults on bad values", [st.CONFIG.contacts[0].name, st.CONFIG.portal, st.CONFIG.contacts[1].name], ["Art", "https://www.drbu.edu/timesheet", "Lee"]);
has("settings missing row", settings("Setting,Value\nStudent Kitchen Manager,Art\n").settingsProblems, "\"Timesheet Portal Link\" row is missing");
check("settings refuse a non-web link", settings("Setting,Value\nTimesheet portal link,javascript:alert(1)\nStudent Kitchen Manager,Art\nWork Study Manager,N\n").CONFIG.portal, "https://www.drbu.edu/timesheet");
check("shipped settings clean", settings(read("settings.csv")).settingsProblems, []);

/* ----------------------------------------------------------- dateKey */
check("dateKey", b.dateKey(new Date(2026, 9, 4)), "2026-10-4");

console.log(passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
