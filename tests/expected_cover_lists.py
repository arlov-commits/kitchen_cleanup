"""Writes tests/expected-cover-lists.csv: every shift's cover list, worked out
from shifts.csv, students.csv and roles.csv by a second, independent
implementation of the rules (this file, in Python). tests/data.test.js then
checks that the app's JavaScript gives exactly the same lists.

    python3 tests/expected_cover_lists.py

The rules (HANDOFF.md, "How the cover lists are worked out"): a backup
covers the shift as its role, or as what roles.csv says it's covered as.
Of those who can do that and aren't working that day: same job first, then
same work group, then everyone else, each fewest shifts first and then A-Z.
The last resort follows: first anyone whose shifts the shift's own student
couldn't take in return, then those working that day in the role's
same-day backup roles, in the order listed. The "Before last resort"
column counts the backups ahead of it."""
import csv, io, os

ROOT = os.path.join(os.path.dirname(__file__), "..")
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def rows(name):
    with open(os.path.join(ROOT, name), encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def split(v):
    return [x.strip().lower() for x in (v or "").replace(",", ";").split(";") if x.strip()]


roles = {}
for r in rows("roles.csv"):
    g = r["Gender"].strip().lower()
    roles[r["Role"].strip().lower()] = {
        "name": r["Role"].strip(),
        "group": r["Work group"].strip().lower() or r["Role"].strip().lower(),
        "as": r.get("Covered as", "").strip().lower(),
        "gender": "any" if g.startswith("any") or not g else ("F" if g.startswith(("w", "f")) else "M"),
        "trained": r["Trained students only"].strip().lower().startswith("y"),
        "same": split(r["Same-day backups (asked last)"]),
    }
people = {r["Student"].strip(): {"gender": r["Gender"].strip().upper()[:1], "only": split(r["Only does"]), "trained": split(r["Trained for"])}
          for r in rows("students.csv")}
shifts = [(r["Student"].strip(), DAYS.index(r["Shift day"].strip()), r["Role"].strip().lower()) for r in rows("shifts.csv")]


def covered_as(role):
    return roles[role]["as"] or role


def can_do(name, role):
    p, R = people[name], roles[role]
    return ((R["gender"] == "any" or p["gender"] == R["gender"])
            and (not p["only"] or role in p["only"])
            and (not R["trained"] or role in p["trained"]))


count = {}
for who, _, _ in shifts:
    count[who] = count.get(who, 0) + 1
names = sorted(count)
jobs = {n: {covered_as(r) for w, _, r in shifts if w == n} for n in names}
groups = {n: {roles[covered_as(r)]["group"] for w, _, r in shifts if w == n} for n in names}

out = io.StringIO()
w = csv.writer(out, lineterminator="\n")
w.writerow(["Student", "Shift day", "Role", "Cover list, in order", "Before last resort"])
for who, day, role in shifts:
    job = covered_as(role)
    working = {n: r for n, d, r in shifts if d == day}

    def key(n):
        tier = 0 if job in jobs[n] else 1 if roles[job]["group"] in groups[n] else 2
        return (tier, count[n], n.lower())

    free = sorted([n for n in names if n not in working and can_do(n, job)], key=key)
    two_way = [n for n in free if all(can_do(who, j) for j in jobs[n])]
    cover = two_way + [n for n in free if n not in two_way]
    for same in roles[job]["same"]:
        cover += sorted([n for n in names if n != who and working.get(n) == same and can_do(n, job)], key=lambda n: (count[n], n.lower()))
    w.writerow([who, DAYS[day], roles[role]["name"], ", ".join(cover), len(two_way)])

with open(os.path.join(ROOT, "tests", "expected-cover-lists.csv"), "w") as f:
    f.write(out.getvalue())
print("wrote", len(shifts), "cover lists")
