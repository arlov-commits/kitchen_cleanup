# Handing over the Kitchen Cleanup app

**For: whoever is handing the app over.** That's you if you look after
the app now and someone else is taking it on, usually the next Student
Kitchen Manager.

The person taking over reads **`HOW-TO-UPDATE.md`**. Once they've taken
over, this page is theirs too, for when it's their turn. The app is meant
to pass down this way every year, from one person to the next, using these
same two pages.

**The app's current links** are at the top of the **README**, the page
GitHub shows when you open the app's files.

---

## How the handover works

The app's files live in a free **GitHub organization**: a shared account
that belongs to the role, not to any one person.

- The people who look after the app are **owners** of the organization.
- At each handover, the outgoing owner makes the incoming person an
  owner. When they're settled in, the outgoing owner leaves.
- The app's link never changes. Students keep using it, and their
  installed copies keep working.

**Always keep two owners**: the Student Kitchen Manager and the Work Study
Manager. If one leaves without handing over, the other can still let the
next person in. If the last owner leaves, nobody can get back in to update
the app.

> **First time only.** If the README's files link has a person's name in
> it rather than an organization's (when this page was written it was
> `github.com/arlov-commits/…`), the organization hasn't been set up yet.
> Do **"Setting up the organization"** at the bottom of this page first.

---

## Before you meet

- [ ] Ask them to make a GitHub account (`HOW-TO-UPDATE.md`, step 1) and
      send you their username.
- [ ] Choose a time: about 30 minutes, with their laptop and their phone.
- [ ] Bring the next semester's shift list if you have it.

## At the handover

1. **Give them access.** Open the organization on GitHub (from the
   README's files link, click the organization's name at the top left).
   Go to **People → Invite member**, enter their username, choose the
   **Owner** role, and send the invitation.
2. **They accept it** (`HOW-TO-UPDATE.md`, step 2). Invitations run out
   after 7 days.
3. **Practice run.** They change the Student Kitchen Manager's name in
   `settings.csv` to their own (`HOW-TO-UPDATE.md`, step 3), then check the
   app (step 5).
4. **New shifts.** If the crew is changing, they update `shifts.csv` and
   `students.csv` (`HOW-TO-UPDATE.md`, step 4) while you watch, and check
   the footer shows no yellow "Check…" text.
5. **Go through the rules.** Read **"How the cover lists are worked
   out"** below together. Point out the students with special settings
   in `students.csv` (anything under **Only does**, **Only covers** or
   **Covered only by same job**) and who is trained as a lunch monitor.
   Explain anything that has changed, and add it to the log.
6. **Their phone.** They open the app and tap **Install as app** at the
   bottom.
7. **Second owner.** Make sure the Work Study Manager is still an owner.
   If they're new too, invite them the same way.

## After the handover

- [ ] Add a line to the **Handover log** below. You can edit this page
      the same way as `settings.csv` (`HOW-TO-UPDATE.md`, step 3).
- [ ] Once they've made a change on their own, leave the organization:
      **People**, find your name, then **Leave** (or ask them to remove you).
      Never leave if it would leave fewer than two owners.

---

## Handover log

Each person handing over adds a line. Newest at the bottom.

| When | Handed over by | To | Notes |
| --- | --- | --- | --- |
| *(first handover)* | | | |

### How the cover lists are worked out

The app works out every shift's cover list itself, from `shifts.csv`,
`students.csv` and `roles.csv`. Nobody types the lists. Every rule below
is either a setting in those files (marked ⚙, so it can be changed
without code) or built into the app.

**The groups.** Each group works on its own. ⚙ *Work group* in `roles.csv`
- **Group A, Lunch Monitors:** Lunch Monitor.
- **Group B, Dishwashing:** team B1, Pots & Pans (and its Shift Leader),
  and team B2, Buckets & Composting.
- **Group C, Recycling:** Recycling.

**The hours,** for the record. They explain Rule 4, and the app doesn't
show them:
- Lunch Monitor: 10:50 to 11:30.
- Pots & Pans and Buckets & Composting: 11:40 to 12:40.
- Recycling: 11:40 to 13:40 on Monday, 11:40 to 12:40 on other days. It
  can be done at any time before 6 pm.

**Rule 1: a Shift Leader is Pots & Pans.** Whoever covers a Shift Leader
shift does Pots & Pans, and in every list and swap it counts as Pots &
Pans. "Shift Leader" appears in one place only: in "On with you" on the
other cards that day, listed first. Even the Shift Leader's own card says
Pots & Pans. ⚙ *Covered as*

**Rule 2: who can do which job.** ⚙ *Gender*, *Trained students only* and
*Trained for*
- Group A (Lunch Monitor) is for women trained as lunch monitors. They can
  also do any Group B job.
- Group B women can do any Group B job.
- Men can do Pots & Pans (B1) and Recycling (Group C).
- Only men do Recycling. Only women do Buckets & Composting and Lunch
  Monitor.

**Rule 3: special students.** Three options in `students.csv`, blank for
almost everyone:
- ⚙ *Only does:* the only jobs they can work.
- ⚙ *Only covers:* the only jobs they can substitute for, or `None`.
- ⚙ *Covered only by same job:* `Yes` means only students who do the same
  job can cover their shifts.

Ben Kong has all three: Recycling, Recycling, Yes. He works and covers
Recycling only, and only Recycling students cover his shifts.

**Rule 4: the same day.** Someone already working that day can cover only
where the hours allow both. ⚙ *Same-day backups*, in order:
- **Pots & Pans:** Recycling (they recycle afterwards), then Lunch
  Monitor (10:50 to 12:40 with a 10-minute break), at the very end.
- **Buckets & Composting:** Lunch Monitor, at the very end.
- **Recycling:** Pots & Pans (recycling can wait until after).
- **Lunch Monitor:** no one.

Nobody else who is working that day is ever listed, and nobody covers
the same job twice in a day.

**Rule 5: the order.** Your shift is a **swap** for a backup if you could
take one of their shifts in return: on another day, and allowed by Rules
1 to 4 (a double the hours allow counts). The list has two parts.
1. **The main list:** students **not working that day** whom you can swap
   with. First priority is the same job on a different date:
   1. **Same job:** they already do this job.
   2. **Same group,** another job, for example Buckets & Composting people
      for a Pots & Pans shift.
   3. **Another group,** for example a lunch monitor.

   Within each, fewest shifts first, then alphabetical order.
2. **The last resort,** boxed off below:
   1. Students not working that day with **no shift you could take back**
      (they'd help without a swap), in the same order.
   2. Students **already working that day** (Rule 4), in the order of the
      same-day backups, each fewest shifts first. They are always last
      resort, even when you could repay them. For example, a man can take a
      Recycling student's Recycling shift on another day.

**Rule 6: what students see.**
- **The week at a glance,** at the top: today's date, then each shift by
  the next date it falls on, with **Today** or **Tomorrow**. The name
  sits beside the heading once chosen.
- **Each card:** the day, the job (Rule 1), and **On with you:** only your
  own group, left out when no one else in it is on. So a Recycling card
  shows it only when two or more do Recycling that day.
- **Shift Backups:** each backup's name, then their shifts you could take
  in return, same job first (all their shifts, in the last resort).
- **My availability** (its own tab): the days you're on someone's list,
  one card per day, spelled out in sentences: who may ask you to work
  their shift that day (as the job it is), and which shift of yours they
  would work in exchange. Anyone whose last resort you are gets a quieter
  sentence at the end of that day.

**Where instructions pulled against each other, and how it's settled.**
For the record, so a later rule change starts from here:
1. *"Buckets & Composting doesn't substitute for Pots & Pans or vice
   versa"* and *"next is same group (Buckets for Pots & Pans)"*. Settled:
   the first applies **on the same day only**, since the hours overlap
   (Rule 4). The second applies on other days (Rule 5, same group).
2. *"Lunch monitors don't get substitutes"* and *"they can only
   substitute amongst themselves"*. Settled: lunch shifts are covered
   only by trained lunch monitors (Rule 2).
3. *"Lunch monitors only substitute amongst themselves"* and *"Group A
   can do the work of Group A or Group B"*. Settled by the later rule:
   lunch monitors can cover Group B shifts. Only another lunch monitor can
   take their lunch shift, though. So for anyone else they're no swap,
   and land in the last resort unless they also have a Group B shift you
   could take.
4. Ben Kong appeared in Pots & Pans lists in an early shift file, against
   *"he cannot work any other role"*. Settled: the rule wins (Rule 3).
5. Same-day Recycling was at first left out: Dishwashing students working
   that day never covered it. Settled by the hours: Recycling can be done
   any time before 6 pm, so a Pots & Pans student working that day can
   do it afterwards, as a last resort (Rule 4).
6. *"Male students aren't ideal same-day substitutes; in an emergency they
   can fill in pro bono, except for a male student, who could repay."*
   Settled: same-day backups are always last resort. Where you could
   repay them, their line shows the shifts you could take.
7. A swap on the very day you're asking to have covered isn't a swap,
   since you won't be there (Rule 5).
8. A swap only counts where the hours allow it. A shift on a day you
   already work counts only as a double Rule 4 allows.

`tests/expected-cover-lists.csv` holds every shift's list as worked out by
a second, independent copy of these rules (`tests/expected_cover_lists.py`),
and the app is tested against it.

---

## Setting up the organization (once)

Do this only if the app's files are still in a personal account. The
app's link changes once, so do it before students start relying on it,
for example between semesters. Old links don't forward to the new one.

1. Sign in to GitHub. Go to **https://github.com/organizations/plan** and
   choose the **Free** plan.
2. Name the organization, for example `drbu-kitchen`. The name becomes
   part of the app's link. Give your email, choose **My personal
   account**, and finish. You can skip inviting people for now.
3. Open the app's files, go to **Settings**, scroll to the **Danger Zone**
   at the bottom, and click **Transfer**. Choose the organization, type the
   names it asks for, and confirm.
4. In the moved files, go to **Settings → Pages**. Under **Build and
   deployment**, set **Source** to **Deploy from a branch**, choose
   **main** and **/ (root)**, and click **Save**.
5. After a minute or two, the app is at
   `https://<organization>.github.io/kitchen_cleanup/`. Open it and check
   that it works.
6. **Update the two links at the top of the README** to the new ones,
   the same way you'd edit `settings.csv`.
7. Invite the Work Study Manager as a second **Owner** (People → Invite
   member).
8. Tell students the new link. Anyone who installed the app from the old
   link needs to install it again from the new one.

---

## Good to know

- **Nothing to renew.** Hosting is free, and the app has no accounts,
  passwords or servers to look after.
- **Nothing is ever lost.** GitHub keeps every earlier version of every
  file.
- **Changes beyond the two files** (wording, the timesheet deadline, the
  tabs) need someone comfortable with code. `CLAUDE.md` holds instructions
  for an AI coding assistant such as Claude Code.
