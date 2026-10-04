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
   in `students.csv`: anyone limited under **Only does**, and who is
   trained as a lunch monitor. Explain anything that has changed, and add
   it to the log.
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

**Words used here**
- **Work groups:** Kitchen (Shift Leader, Pots & Pans, Buckets &
  Composting), Recycling, and Lunch Monitor. ⚙ *Work group*
- **Covered as:** a Shift Leader is a leader within Pots & Pans. Whoever
  covers a Shift Leader covers as Pots & Pans, and the shift goes without
  a leader. ⚙ *Covered as*
- **A student's jobs:** the roles of their shifts, as covered (a Shift
  Leader shift counts as Pots & Pans).

**Rule 1: who can do a role.** A student can do a role, and so cover it,
only if all three allow it:
- **gender** ⚙ *Gender*: Recycling is men only. Buckets & Composting and
  Lunch Monitor are women only. Pots & Pans (and so Shift Leader) is
  anyone.
- **limits** ⚙ *Only does*: Ben Kong does Recycling only.
- **training** ⚙ *Trained students only* / *Trained for*: only trained
  lunch monitors can do Lunch Monitor.

**Rule 2: a swap is shift for shift.** A backup's shift is a **swap
option** for you if you can do its role (Rule 1) and you aren't already
working that day. A backup with at least one swap option is someone
you can **swap with**.

**Rule 3: the main list.** These are students **not working that day** who
can do the role (Rule 1) and whom you can swap with (Rule 2), in three
tiers:
1. **Same job:** they already do this job.
2. **Same work group**, another job, for example Buckets & Composting
   people for a Pots & Pans shift.
3. **A different work group.**

Within each tier, fewest shifts come first, then alphabetical order.

**Rule 4: the last resort,** boxed off below the main list, in this order:
1. Students **not working that day** who can do the role, but whom you
   can't swap with (no swap option), in the same tier order.
2. Students **already working that day** in one of the role's **same-day
   backup** roles ⚙ *Same-day backups*, in the order listed, each fewest
   shifts first:
   - Pots & Pans and Shift Leader: Recycling, then Lunch Monitor, at the
     very end.
   - Buckets & Composting: Lunch Monitor, at the very end.
   - Recycling and Lunch Monitor: none.

   Nobody else who is working that day is ever listed. So Buckets &
   Composting and Pots & Pans never cover each other on the same day.

**Rule 5: what students see.**
- **On with you:** only your own work group, and left out when no one
  else in it is on. So a Recycling card shows it only when two or more do
  Recycling that day.
- **Can cover for you:** each backup's name, with their swap options
  underneath (all their shifts, in the last resort). Substitute lists
  never say "Shift Leader": that shift shows as Pots & Pans.
- **My availability:** each day you're on someone's list, by the role
  you'd cover as. For each person, the shifts of yours they could take in
  return. People whose last resort you are get one quiet line.

**Where your instructions pulled against each other, and how it's
settled.** For the record, so a later rule change starts from here:
1. *"Buckets & Composting doesn't substitute for Pots & Pans or vice
   versa"* and *"next is same group (Buckets for Pots & Pans)"*. Settled:
   the first applies **on the same day only** (Rule 4), the second on
   other days (Rule 3, tier 2). This matches the original hand-made lists.
2. *"Lunch monitors don't get substitutes"* and *"they can only
   substitute amongst themselves"*. Settled: lunch shifts are covered
   only by trained lunch monitors (Rule 1), as in the hand-made lists.
3. *"Lunch monitors only substitute amongst themselves"* and lunch
   monitors appearing in Pots & Pans and Buckets lists (*"same day, very
   last"*). Settled: lunch monitors **can** cover other women's shifts.
   No one else can take their lunch shift, though, so for an untrained
   student they're no swap and land in the last resort (Rules 2 and 4).
4. *"Lunch monitors on other days: regular order"* and *"they shouldn't
   be a viable option that often"* / *"square them off as last resort"*.
   Settled by the later instruction: no swap means last resort.
5. Ben Kong appeared in Pots & Pans lists in the shift file, against
   *"he cannot work any other role"*. Settled: the rule wins. He is only
   ever a backup for Recycling.
6. *"Fourth: a different group on the same day"* (in general) and the
   hand-made lists, where Kitchen students working that day never cover
   Recycling. Settled: only the same-day roles listed in `roles.csv`
   count. To let Kitchen men working that day be a last resort for
   Recycling, add `Pots & Pans; Shift Leader` to Recycling's
   *Same-day backups*.
7. *"Swap options"* counted roles but not days, so someone whose only
   matching shifts fell on your own working days looked like a swap.
   Settled: a swap option has to be on a day you're free (Rule 2).
8. *My availability* listed days where you'd only be someone's last
   resort, as if you were a main backup. Settled: those are on their own
   quiet line (Rule 5).

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
