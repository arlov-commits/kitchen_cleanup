/* Checks for the data functions in index.html: node tests/data.test.js
   Each function is lifted out of index.html by name and run on its own, so
   these tests always exercise the code the app actually ships.

   tests/expected-cover-lists.csv is the reference: every shift's cover
   list, written by tests/expected_cover_lists.py, a second implementation
   of the rules in Python. The app's JavaScript must give exactly the same
   lists and swap options from shifts.csv, students.csv and roles.csv. */
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
    MONTHS: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    FILES: { shifts: "shifts.csv", students: "students.csv", roles: "roles.csv" },
    CONFIG: { contacts: [{ role: "Student Kitchen Manager", name: "Art" }, { role: "Work Study Manager", name: "Nahelia" }],
              portal: "https://www.drbu.edu/timesheet" },
    settingsProblems: [], data: null, PDF_H: 844, PDF_TOP: 18
  };
  vm.createContext(box);
  /* the strings, in every language */
  vm.runInContext(html.slice(html.indexOf("var STR = {"), html.indexOf("/* END STRINGS */")) + "; this.STR = STR; var lang = 'en';", box);
  ["esc", "parseCSV", "dayIndex", "lower", "header", "cell", "list", "personGender", "roleGender", "yes",
   "readRoles", "readStudents", "canDo", "canCover", "buildData", "roleRank", "applySettings", "dateKey",
   "nextDate", "longDate", "shortDate", "whenPill", "t", "dayName", "dayShort",
   "stripMedia", "pdfCuts", "pdfText", "makePDF"].forEach(function (n) {
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
check("shipped: every backup's swap options match the reference", expected.filter(function (r) {
  var s = shiftOf(real, r[0], r[1]);
  return s.cover.map(function (n) {
    return n + ": " + (s.swap[n].slice().sort(function (x, y) { return x.day - y.day; }).map(function (x) { return b.DAYS[x.day] + " " + x.as; }).join(", ") || "none");
  }).join("; ") !== r[5];
}).map(function (r) { return r[0] + " " + r[1]; }), []);
check("shipped: the reference covers every shift", expected.length, real.shifts.length);
check("role order from roles.csv", ["Shift Leader", "Pots & Pans", "Buckets & Composting", "Recycling", "Lunch Monitor"].map(function (r) { return real.roleRank[r]; }), [0, 1, 2, 3, 4]);
check("work groups: Group B Dishwashing, Group C Recycling, Group A Lunch Monitors", ["Ivwananji|Monday", "Adam|Monday", "Aryashree|Monday", "Adrian|Monday", "Shuxing|Monday"].map(function (k) {
  var p = k.split("|"); return shiftOf(real, p[0], p[1]).group;
}), ["dishwashing", "dishwashing", "dishwashing", "recycling", "lunch monitors"]);

/* the rules, one by one, on the shipped files (HANDOFF.md numbering) */
var S = function (day, as) { return { day: b.DAYS.indexOf(day), as: as }; };
var R = function (who, day) { var s = shiftOf(real, who, day); return { cover: s.cover, main: s.cover.slice(0, s.lastFrom), last: s.cover.slice(s.lastFrom), swap: s.swap }; };

/* Rule 1: a Shift Leader shift is a Pots & Pans shift */
check("1: Shift Leader is covered as Pots & Pans", [shiftOf(real, "Adrian", "Wednesday").as, shiftOf(real, "Adrian", "Wednesday").role], ["Pots & Pans", "Shift Leader"]);
check("1: a Shift Leader's backups are a Pots & Pans shift's backups that day",
  R("Adrian", "Wednesday").cover.slice().sort(), R("Vayu", "Wednesday").cover.slice().sort());
check("1: a Shift Leader counts as doing Pots & Pans (Adrian before the lunch monitors on Adam's Tuesday)",
  R("Adam", "Tuesday").cover.indexOf("Adrian") < R("Adam", "Tuesday").cover.indexOf("Shuxing"), true);
check("1: swap options show a Shift Leader shift as Pots & Pans", R("Adam", "Monday").swap.Tsering, [S("Friday", "Pots & Pans")]);

/* Rule 2: who can do which job */
check("2: men never cover Buckets or Lunch Monitor", real.shifts.filter(function (s) {
  return /Buckets|Lunch/.test(s.role) && s.cover.some(function (c) { return MEN.test(c); });
}).length, 0);
check("2: women never cover Recycling", real.shifts.filter(function (s) {
  return s.role === "Recycling" && s.cover.some(function (c) { return !MEN.test(c); });
}).length, 0);
check("2: Lunch Monitor: only trained lunch monitors, fewest shifts first", R("Thanh", "Tuesday").cover, ["Shuxing", "Amelia"]);
check("2: lunch monitors can do Group B jobs", [R("Aryashree", "Monday").cover.indexOf("Thanh") >= 0, R("Adam", "Monday").cover.indexOf("Thanh") >= 0], [true, true]);
check("2: men can do Pots & Pans", R("Beth", "Thursday").cover.indexOf("Adrian") >= 0, true);

/* Rule 3: special students (Ben Kong: Recycling only, both ways) */
check("3: Ben Kong only ever covers Recycling", real.shifts.filter(function (s) { return s.role !== "Recycling" && s.cover.indexOf("Ben Kong") >= 0; }).length, 0);
check("3: Ben Kong covers Recycling", R("Vayu", "Monday").main, ["Ben Kong"]);
check("3: Ben Kong's shifts are covered only by those who do Recycling", real.shifts.filter(function (s) {
  return s.who === "Ben Kong" && s.cover.some(function (c) { return !/^(Adam|Adrian|Vayu)$/.test(c); });
}).length, 0);
check("3: Ben Kong swaps Recycling for Recycling", [R("Ben Kong", "Friday").main, R("Ben Kong", "Friday").swap.Adam], [["Adam", "Vayu"], [S("Thursday", "Recycling")]]);

/* Rule 4: the same day, where the hours allow a double */
check("4: Pots & Pans: Recycling that day, then Lunch Monitor that day, last", R("Adam", "Monday").last, ["Irina", "Thanh", "Adrian", "Vayu", "Shuxing"]);
check("4: Buckets: Lunch Monitor that day, last; never Pots & Pans that day", R("Amelia", "Thursday").cover, ["Irina", "Nita", "Roxanne", "Ivwananji", "Priya", "Tsering", "Thanh", "Shuxing"]);
check("4: Recycling: a man on Pots & Pans that day, last (recycling can wait till after)", [R("Adam", "Thursday").cover, R("Adam", "Thursday").main], [["Adrian", "Ben Kong", "Vayu"], ["Adrian", "Ben Kong"]]);
check("4: Lunch Monitor: no one working that day", R("Shuxing", "Monday").cover, ["Thanh"]);
check("4: no one covers their own shift", real.shifts.every(function (s) { return s.cover.indexOf(s.who) < 0; }), true);
check("4: no one doing the same job that day covers it", R("Adrian", "Monday").cover.indexOf("Vayu"), -1);
check("4: a same-day backup is last resort even with a swap", [R("Adrian", "Monday").last, R("Adrian", "Monday").swap.Adam],
  [["Adam"], [S("Tuesday", "Pots & Pans"), S("Thursday", "Recycling")]]);

/* Rule 5: the order, and swaps */
check("5: the main list is those you could cover back; the last resort is the rest",
  [R("Adam", "Monday").main, shiftOf(real, "Adam", "Monday").lastFrom], [["Beth", "Lavanya", "Priya", "Roxanne", "Tsering"], 5]);
check("5: same job, then same group, then another group, each fewest shifts first",
  R("Aryashree", "Monday").cover, ["Irina", "Roxanne", "Beth", "Lavanya", "Priya", "Tsering", "Thanh", "Shuxing"]);
check("5: swaps go shift by shift: Roxanne's Wednesday Pots & Pans, not her Buckets", R("Adam", "Monday").swap.Roxanne, [S("Wednesday", "Pots & Pans")]);
check("5: a swap can be a double the hours allow: Beth's Thursday Pots & Pans, before Adam's Recycling",
  R("Adam", "Monday").swap.Beth, [S("Wednesday", "Pots & Pans"), S("Thursday", "Pots & Pans")]);
check("5: no swap on a day the hours don't allow: Irina's Pots & Pans is Tuesday, when Adam does Pots & Pans", R("Adam", "Monday").swap.Irina, []);
check("5: never a swap on the day being covered", real.shifts.every(function (s) {
  return Object.keys(s.swap).every(function (n) { return s.swap[n].every(function (x) { return x.day !== s.day; }); });
}), true);
check("5: Aryashree, Tuesday: the last resort is those with no shift she could take",
  [R("Aryashree", "Tuesday").last, shiftOf(real, "Aryashree", "Tuesday").lastFrom], [["Huiyi", "Amelia", "Shuxing", "Thanh"], 6]);
check("5: Aryashree can swap with Adrian for his Pots & Pans, not his Recycling",
  R("Aryashree", "Tuesday").swap.Adrian, [S("Wednesday", "Pots & Pans"), S("Friday", "Pots & Pans")]);
check("5: a lunch monitor who can do everything a backup does swaps both ways", shiftOf(real, "Thanh", "Tuesday").lastFrom, 2);
check("5: everyone in the main list has a swap", real.shifts.every(function (s) {
  return s.cover.slice(0, s.lastFrom).every(function (n) { return s.swap[n].length > 0; });
}), true);
check("5: the last resort line is inside the list", real.shifts.every(function (s) { return s.lastFrom >= 0 && s.lastFrom <= s.cover.length; }), true);

/* the switches in roles.csv and students.csv */
var anyRec = build(null, null, edit(ROLES, "Recycling,Recycling,,Men only,No,", "Recycling,Recycling,,Any,No,"));
check("switch: Recycling to Any lets women cover it, after those who do Recycling", coverOf(anyRec, "Adam", "Thursday").slice(0, 3), ["Adrian", "Ben Kong", "Ivwananji"]);
check("switch: Recycling to Any adds no problems", anyRec.problems, []);
var womenRec = build(null, null, edit(ROLES, "Recycling,Recycling,,Men only,No,", "Recycling,Recycling,,Women only,No,"));
has("switch: Recycling to Women only flags the men on it", womenRec.problems, "Adam can't do Recycling");
var anyBuckets = build(null, null, edit(ROLES, "Buckets & Composting,Dishwashing,,Women only,", "Buckets & Composting,Dishwashing,,Any,"));
check("switch: Buckets to Any lets men cover it (Ben Kong still can't)", coverOf(anyBuckets, "Amelia", "Thursday").filter(function (c) { return MEN.test(c); }), ["Adrian"]);
var freeBen = build(null, edit(STUDENTS, "Ben Kong,M,,Recycling,Recycling,Yes", "Ben Kong,M,,,,"));
check("switch: Ben Kong with no options covers Pots & Pans", coverOf(freeBen, "Adam", "Monday").indexOf("Ben Kong") >= 0, true);
check("switch: and anyone who can do Recycling covers his", coverOf(freeBen, "Ben Kong", "Tuesday"), ["Adrian", "Adam", "Vayu"]);
var benCovers = build(null, edit(STUDENTS, "Ben Kong,M,,Recycling,Recycling,Yes", "Ben Kong,M,,,Recycling,Yes"));
check("switch: Only covers alone keeps him to covering Recycling", benCovers.shifts.filter(function (s) { return s.role !== "Recycling" && s.cover.indexOf("Ben Kong") >= 0; }).length, 0);
check("switch: Only covers adds no problems", benCovers.problems, []);
var bethNone = build(null, edit(STUDENTS, "Beth,F,,,,", "Beth,F,,,None,"));
check("switch: Only covers None: on no one's list", bethNone.shifts.filter(function (s) { return s.cover.indexOf("Beth") >= 0; }).length, 0);
check("switch: Only covers None: still has backups of her own", coverOf(bethNone, "Beth", "Wednesday").length > 0, true);
check("switch: Only covers None adds no problems", bethNone.problems, []);
var bethSame = build(null, edit(STUDENTS, "Beth,F,,,,", "Beth,F,,,,Yes"));
check("switch: Covered only by same job: only those who do Pots & Pans cover Beth", coverOf(bethSame, "Beth", "Wednesday"),
  R("Beth", "Wednesday").cover.filter(function (c) { return c !== "Shuxing" && c !== "Thanh"; }));
check("switch: Covered only by same job: she still covers others", coverOf(bethSame, "Adam", "Monday"), R("Adam", "Monday").cover);
var twoRoles = build(null, edit(STUDENTS, "Beth,F,,,,", "Beth,F,,Pots & Pans; Shift Leader,,"));
check("switch: Only does two roles covers those", coverOf(twoRoles, "Adam", "Monday").indexOf("Beth") >= 0, true);
check("switch: but not a third", coverOf(twoRoles, "Aryashree", "Monday").indexOf("Beth"), -1);
var untrained = build(null, null, edit(ROLES, "Lunch Monitor,Lunch Monitors,,Women only,Yes,", "Lunch Monitor,Lunch Monitors,,Women only,No,"));
check("switch: Lunch Monitor untrained opens it to all women", coverOf(untrained, "Thanh", "Tuesday").length > 2, true);
var bethTrained = build(null, edit(STUDENTS, "Beth,F,,,,", "Beth,F,Lunch Monitor,,,"));
check("switch: training a student adds them to Lunch Monitor lists", coverOf(bethTrained, "Thanh", "Tuesday").indexOf("Beth") >= 0, true);
var noSame = build(null, null, edit(ROLES, "Pots & Pans,Dishwashing,,Any,No,Recycling; Lunch Monitor", "Pots & Pans,Dishwashing,,Any,No,"));
check("switch: no same-day backups for Pots & Pans", coverOf(noSame, "Adam", "Monday"), ["Beth", "Lavanya", "Priya", "Roxanne", "Tsering", "Irina", "Thanh"]);
check("switch: and no doubles as swaps either", shiftOf(noSame, "Adam", "Monday").swap.Beth, [S("Wednesday", "Pots & Pans")]);
var lmFirst = build(null, null, edit(ROLES, "Recycling; Lunch Monitor", "Lunch Monitor; Recycling"));
check("switch: same-day order follows the list", coverOf(lmFirst, "Adam", "Monday").slice(-3), ["Shuxing", "Adrian", "Vayu"]);
var noRecSame = build(null, null, edit(ROLES, "Recycling,Recycling,,Men only,No,Pots & Pans", "Recycling,Recycling,,Men only,No,"));
check("switch: no same-day backups for Recycling", coverOf(noRecSame, "Adam", "Thursday"), ["Adrian", "Ben Kong"]);
var leaderSame = build(null, null, edit(ROLES, "Recycling,Recycling,,Men only,No,Pots & Pans", "Recycling,Recycling,,Men only,No,Shift Leader"));
check("switch: a same-day backup named Shift Leader means Pots & Pans", coverOf(leaderSame, "Adam", "Thursday"), R("Adam", "Thursday").cover);
var ownGroup = build(null, null, edit(ROLES, "Buckets & Composting,Dishwashing,", "Buckets & Composting,,"));
check("switch: Buckets in its own group drops Dishwashing people to the third tier", coverOf(ownGroup, "Aryashree", "Monday"), ["Irina", "Roxanne", "Beth", "Lavanya", "Priya", "Tsering", "Thanh", "Shuxing"]);
check("switch: a blank work group makes a role its own group", shiftOf(ownGroup, "Aryashree", "Monday").group, "buckets & composting");
var leaderOwn = build(null, null, edit(ROLES, "Shift Leader,Dishwashing,Pots & Pans,", "Shift Leader,Dishwashing,,"));
check("switch: Shift Leader not covered as Pots & Pans: Shift Leaders first", coverOf(leaderOwn, "Adrian", "Wednesday").slice(0, 2), ["Lavanya", "Tsering"]);
check("switch: and it has no same-day backups of its own", coverOf(leaderOwn, "Adrian", "Wednesday").indexOf("Amelia"), -1);
check("switch: students.csv without the optional columns", build(null, "Student,Gender,Only does,Trained for\n" +
  b.parseCSV(STUDENTS).slice(1).map(function (r) { return [r[0], r[1], r[3], r[2]].join(","); }).join("\n")).problems, []);

/* ----------------------------------------------- the files' checks */
function probs(shifts, students, roles) { return build(shifts, students, roles).problems; }
has("roles: missing column", probs(null, null, "Role,Gender\nPots & Pans,Any\n"), "roles.csv is missing a column: group, trained, same");
has("roles: bad gender", probs(null, null, edit(ROLES, "Recycling,,Men only", "Recycling,,Nobody")), "Recycling's gender should be Any, Women only or Men only");
has("roles: covered as an unknown role", probs(null, null, edit(ROLES, "Shift Leader,Dishwashing,Pots & Pans", "Shift Leader,Dishwashing,Pots")), "Shift Leader is covered as \"pots\", which isn't a role");
check("roles: Covered as is optional", build(null, null, ROLES.replace(/,Covered as/, "").replace(/(\r?\n[^,\r\n]*,[^,\r\n]*),[^,\r\n]*/g, "$1")).problems, []);
has("roles: duplicate", probs(null, null, ROLES + "Recycling,Recycling,Any,No,\r\n"), "Recycling is listed twice");
has("roles: same-day names an unknown role", probs(null, null, edit(ROLES, "Recycling; Lunch Monitor", "Recycling; Lunch")), "\"lunch\", which isn't a role");
has("students: bad gender", probs(null, edit(STUDENTS, "Beth,F,", "Beth,X,")), "Beth's gender should be F or M");
has("students: duplicate", probs(null, STUDENTS + "Beth,F,,\r\n"), "Beth is listed twice");
has("students: unknown role", probs(null, edit(STUDENTS, "Ben Kong,M,,Recycling,", "Ben Kong,M,,Recyclng,")), "\"recyclng\" isn't a role in roles.csv");
has("students: unknown role under Only covers", probs(null, edit(STUDENTS, "Ben Kong,M,,Recycling,Recycling,", "Ben Kong,M,,Recycling,Recyclin,")), "\"recyclin\" isn't a role in roles.csv");
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

/* ------------------------------------------------- the week at a glance */
var sun = new Date(2026, 9, 4, 21, 30), wed = new Date(2026, 9, 7, 8, 0);   /* Sunday Oct 4, Wednesday Oct 7 */
check("nextDate: from a Sunday, Monday is tomorrow and Sunday is today", [0, 2, 6].map(function (d) { return b.dateKey(b.nextDate(d, sun)); }),
  ["2026-10-5", "2026-10-7", "2026-10-4"]);
check("nextDate: from a Wednesday, Monday is next week", [0, 2, 3].map(function (d) { return b.dateKey(b.nextDate(d, wed)); }),
  ["2026-10-12", "2026-10-7", "2026-10-8"]);
check("nextDate: across a month and a year", [b.dateKey(b.nextDate(0, new Date(2026, 9, 30))), b.dateKey(b.nextDate(2, new Date(2026, 11, 31)))],
  ["2026-11-2", "2027-1-6"]);
check("longDate", [b.longDate(sun), b.longDate(new Date(2027, 0, 1))], ["Sunday, October 4", "Friday, January 1"]);
check("shortDate", b.shortDate(new Date(2026, 8, 30)), "Sep 30");
check("whenPill: Today, Tomorrow (Sunday into Monday), nothing", [b.whenPill(6, 6), b.whenPill(0, 6), b.whenPill(2, 6)],
  ['<span class="when">Today</span>', '<span class="when tmrw">Tomorrow</span>', ""]);

/* ------------------------------------------------------ Save as PDF */
check("stripMedia drops @media blocks, nested ones too", b.stripMedia("a{x:1}@media (min-width:9px){b{y:2}c{z:3}}d{w:4}@media print{@page{m:0}e{v:5}}"), "a{x:1}d{w:4}");
check("the app's own CSS keeps balanced braces without its @media blocks", (function () {
  var css = b.stripMedia(html.slice(html.indexOf("<style>") + 7, html.indexOf("</style>")));
  return [css.indexOf("@media"), (css.match(/\{/g) || []).length === (css.match(/\}/g) || []).length];
})(), [-1, true]);
check("pdfCuts: a short part is one page", JSON.stringify(b.pdfCuts(500, [100, 300])), "[[0,500,0]]");
check("pdfCuts: cut at the last gap that fits, later pages with a top margin", JSON.stringify(b.pdfCuts(2000, [100, 700, 830, 900, 1500, 1640])),
  "[[0,830,0],[830,1640,18],[1640,2000,18]]");
check("pdfCuts: no gap that fits: cut at the page's foot", JSON.stringify(b.pdfCuts(1000, [10])), "[[0,844,0],[844,1000,18]]");
check("pdfText: plain text, and anything else as UTF-16", [b.pdfText("a (b) \\c"), b.pdfText("班 · x")], ["(a \\(b\\) \\\\c)", "<FEFF73ED002000B700200078>"]);
var pdfBytes = b.makePDF([
  { w: 390, h: 844, iw: 2, ih: 2, jpg: new Uint8Array([255, 216, 1, 2, 255, 217]), links: [{ x: 10, y: 20, w: 100, h: 30, page: 1 }] },
  { w: 390, h: 844, iw: 2, ih: 2, jpg: new Uint8Array([255, 216, 3, 255, 217]), links: [{ x: 0, y: 800, w: 50, h: 20, uri: "https://www.drbu.edu/timesheet" }] }
], [{ title: "My shifts", page: 0 }, { title: "請假", page: 1 }], { title: "Kitchen Cleanup · Ann", date: "20261006090000" });
var pdf = Buffer.from(pdfBytes).toString("latin1");
check("makePDF: a PDF from header to end", [pdf.slice(0, 8), /%%EOF\n$/.test(pdf)], ["%PDF-1.4", true]);
check("makePDF: every object where the cross-reference table says", (function () {
  var xr = pdf.lastIndexOf("\nxref\n") + 1, x = pdf.slice(xr).split("\n"), n = +x[1].split(" ")[1], bad = [];
  for (var i = 1; i < n; i++) { var at = +x[2 + i].slice(0, 10); if (pdf.slice(at, at + String(i).length + 6) !== i + " 0 obj") bad.push(i); }
  return [n > 10, bad, +pdf.slice(pdf.lastIndexOf("startxref\n") + 10).split("\n")[0] === xr];
})(), [true, [], true]);
check("makePDF: two pages, a link to page 2, a web link, two bookmarks, the pictures",
  [(pdf.match(/\/Type \/Page /g) || []).length, /\/Rect \[10\.00 794\.00 110\.00 824\.00\] \/Dest \[\d+ 0 R \/XYZ 0 844 0\]/.test(pdf), pdf.indexOf("/URI (https://www.drbu.edu/timesheet)") > 0,
   /\/Outlines \d+ 0 R/.test(pdf) && /\/Count 2 >>/.test(pdf), pdf.indexOf("<FEFF8ACB5047>") > 0, (pdf.match(/\/Filter \/DCTDecode \/Length \d+ >>\nstream\n\xff\xd8/g) || []).length],
  [2, true, true, true, true, 2]);

/* ------------------------------------------------------ the languages */
var langs = Object.keys(b.STR);
check("languages", langs, ["en", "zh-Hans", "zh-Hant", "th", "vi"]);
function marks(v) {
  if (Array.isArray(v)) return "list of " + v.length;
  return JSON.stringify([(v.match(/\{\w+\}/g) || []).sort(), (v.match(/<\/?\w+/g) || []).sort(), (v.match(/\[/g) || []).length]);
}
langs.slice(1).forEach(function (l) {
  check(l + ": the same strings as English", Object.keys(b.STR[l]).sort(), Object.keys(b.STR.en).sort());
  check(l + ": each keeps English's {names}, tags and [brackets]", Object.keys(b.STR.en).filter(function (k) {
    return k in b.STR[l] && marks(b.STR[l][k]) !== marks(b.STR.en[k]);
  }), []);
  check(l + ": nothing left empty or in English by mistake", Object.keys(b.STR.en).filter(function (k) {
    var v = b.STR[l][k];
    return !v || (typeof v === "string" && v === b.STR.en[k]);
  }), []);
});
check("roles and the managers' titles stay in English", langs.every(function (l) {
  return /Student Kitchen Manager/.test(b.STR[l].s3t) && /Shift Leader/.test(b.STR[l].f3) && /DRBU/.test(b.STR[l].f2);
}), true);
var dates = langs.map(function (l) {
  b.lang = l;
  var r = [b.longDate(new Date(2026, 9, 4)), b.shortDate(new Date(2026, 9, 5)), b.dayShort(0), b.t("shift_backups", { n: 3 })];
  return r;
});
b.lang = "en";
check("dates and words in each language", dates, [
  ["Sunday, October 4", "Oct 5", "Mon", "Shift Backups · 3"],
  ["10月4日 星期日", "10月5日", "周一", "替班人选 · 3"],
  ["10月4日 星期日", "10月5日", "週一", "代班人選 · 3"],
  ["วันอาทิตย์ที่ 4 ตุลาคม", "5 ต.ค.", "จ.", "ตัวสำรอง · 3"],
  ["Chủ nhật, 4 tháng 10", "5/10", "T2", "Người dự phòng · 3"]]);
check("a missing string falls back to English, then to its key", [b.t("nope"), (b.lang = "th", b.t("copied")), (delete b.STR.th.copied, b.t("copied"))], ["nope", "คัดลอกแล้ว", "Copied"]);
b.lang = "en";

console.log(passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
