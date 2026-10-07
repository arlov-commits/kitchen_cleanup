"""Writes tests/expected-cover-lists.csv: every shift's cover list, worked out
from shifts.csv, students.csv and roles.csv by a second, independent
implementation of the rules (this file, in Python). tests/data.test.js then
checks that the app's JavaScript gives exactly the same lists.

    python3 tests/expected_cover_lists.py

The rules are in HANDOFF.md, "How the cover lists are worked out":
- Rule 1: a shift's job is its role as covered (Shift Leader is Pots & Pans).
- Rule 2: gender and training decide who can do a job.
- Rule 3: a student's Only does, Only covers and Covered only by same job.
- Rule 4: someone already working that day can cover only if their job
  that day is one of the job's same-day backups.
- Rule 5: those free that day whom the student could cover back (on another
  day) come first: same job, same work group, other group, each fewest
  shifts first, then A-Z. Then the last resort: those free that day with no
  shift to take back, then those working that day, in same-day order.
- Rule 7: the availability form. Someone who answered "Not available" for a
  day is never a backup that day, and is never offered a swap on that day.
  Someone who answered "Maybe" for a day moves to just above the last resort
  (in the same order among themselves). A later answer replaces an earlier
  one; a blank counts as available.
The "Before last resort" column counts the backups ahead of it, and "Swap
options" gives each backup's shifts the student could take in return
("Beth: Wednesday Pots & Pans, Thursday Pots & Pans; Irina: none").

It also writes tests/expected-cover-lists-availability.csv: the same, with
the made-up answers in tests/sample-availability-answers.csv (shaped like
the Google Form's published sheet)."""
import csv, io, os, re

ROOT = os.path.join(os.path.dirname(__file__), "..")
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def rows(name):
    with open(os.path.join(ROOT, name), encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def split(v):
    return [x.strip().lower() for x in (v or "").replace(",", ";").split(";") if x.strip()]


def yes(v):
    return (v or "").strip().lower() in ("y", "yes", "true", "1")


roles = {}
for r in rows("roles.csv"):
    g = r["Gender"].strip().lower()
    roles[r["Role"].strip().lower()] = {
        "name": r["Role"].strip(),
        "group": r["Work group"].strip().lower() or r["Role"].strip().lower(),
        "as": r.get("Covered as", "").strip().lower(),
        "gender": "any" if g.startswith("any") or not g else ("F" if g.startswith(("w", "f")) else "M"),
        "trained": yes(r["Trained students only"]),
        "same": split(r["Same-day backups (asked last)"]),
    }


def covered_as(role):
    return roles[role]["as"] or role


people = {}
for r in rows("students.csv"):
    people[r["Student"].strip()] = {
        "gender": r["Gender"].strip().upper()[:1],
        "only": split(r["Only does"]),
        "trained": split(r["Trained for"]),
        "covers": split(r.get("Only covers")),
        "same_job_only": yes(r.get("Covered only by same job")),
    }
# (student, day, job): the job is the role as covered
shifts = [(r["Student"].strip(), DAYS.index(r["Shift day"].strip()), r["Role"].strip().lower()) for r in rows("shifts.csv")]
jobs_of = [(w, d, covered_as(r)) for w, d, r in shifts]

count = {}
for who, _, _ in shifts:
    count[who] = count.get(who, 0) + 1
names = sorted(count)
jobs = {n: {j for w, _, j in jobs_of if w == n} for n in names}
groups = {n: {roles[j]["group"] for w, _, j in jobs_of if w == n} for n in names}
job_on = {(w, d): j for w, d, j in jobs_of}


def can_do(name, job):
    p, R = people[name], roles[job]
    return ((R["gender"] == "any" or p["gender"] == R["gender"])
            and (not p["only"] or job in p["only"])
            and (not R["trained"] or job in p["trained"]))


def can_cover(name, job):
    covers = people[name]["covers"]
    return can_do(name, job) and "none" not in covers and (not covers or job in covers)


def same_day_ok(job, other):
    # a same-day backup role may be named as itself or as what it's covered as
    return other in [covered_as(x) for x in roles[job]["same"]]


def answer(v):
    v = (v or "").strip().lower()
    if any(w in v for w in ("maybe", "not sure", "unsure")):
        return "maybe"
    if re.match(r"(not|no\b|n$|unavailable)", v):
        return "no"
    return ""


def read_answers(name):
    """{student: {day: "no" or "maybe"}}, the last row for each student winning"""
    with open(os.path.join(ROOT, name), encoding="utf-8-sig") as f:
        table = list(csv.reader(f))
    head, out = table[0], {}
    who_col = next(i for i, h in enumerate(head) if "name" in h.lower() or "student" in h.lower())
    day_cols = [(i, DAYS.index(d)) for i, h in enumerate(head) for d in DAYS if h.rstrip().endswith("[" + d + "]") or h.strip() == d]
    by_lower = {n.lower(): n for n in names}
    for r in table[1:]:
        who = by_lower.get(r[who_col].strip().lower())
        if who:
            out[who] = {d: answer(r[i]) for i, d in day_cols if answer(r[i])}
    return out


said = {}


def eligible(n, owner, day, job):
    if n == owner or not can_cover(n, job) or said.get(n, {}).get(day) == "no":
        return False
    if people[owner]["same_job_only"] and job not in jobs[n]:
        return False
    today = job_on.get((n, day))
    return today is None or same_day_ok(job, today)


def write(file):
    out = io.StringIO()
    w = csv.writer(out, lineterminator="\n")
    w.writerow(["Student", "Shift day", "Role", "Cover list, in order", "Before last resort", "Swap options"])
    for who, day, role in shifts:
        job = covered_as(role)
        can = [n for n in names if eligible(n, who, day, job)]
        swaps = {n: [(d, j) for w2, d, j in jobs_of if w2 == n and d != day and eligible(who, n, d, j)] for n in can}

        def tiered(n):
            tier = 0 if job in jobs[n] else 1 if roles[job]["group"] in groups[n] else 2
            return (tier, count[n], n.lower())

        def maybe(n):
            return said.get(n, {}).get(day) == "maybe"

        free = [n for n in can if (n, day) not in job_on]
        main = sorted([n for n in free if swaps[n] and not maybe(n)], key=tiered)
        unsure = sorted([n for n in free if swaps[n] and maybe(n)], key=tiered)
        one_way = sorted([n for n in free if not swaps[n]], key=tiered)
        same = [covered_as(x) for x in roles[job]["same"]]
        same_day = sorted([n for n in can if (n, day) in job_on], key=lambda n: (same.index(job_on[(n, day)]), count[n], n.lower()))
        cover = main + unsure + one_way + same_day
        options = "; ".join(n + ": " + (", ".join(DAYS[d] + " " + roles[j]["name"] for d, j in sorted(swaps[n])) or "none") for n in cover)
        w.writerow([who, DAYS[day], roles[role]["name"], ", ".join(cover), len(main) + len(unsure), options])
    with open(os.path.join(ROOT, "tests", file), "w") as f:
        f.write(out.getvalue())


write("expected-cover-lists.csv")
said = read_answers("tests/sample-availability-answers.csv")
write("expected-cover-lists-availability.csv")
print("wrote", len(shifts), "cover lists, twice")
