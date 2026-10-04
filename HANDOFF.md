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
`students.csv` and `roles.csv`. Nobody types the lists. Changing a rule
means changing one of those files (`HOW-TO-UPDATE.md`, "Changing a rule").

**Three work groups.** Kitchen (Shift Leader, Pots & Pans, Buckets &
Composting), Recycling, and Lunch Monitor work separately. "On with you"
on a shift card shows only your own group, and is left out when no one
else in your group is on that day. That's why a Recycling or Lunch Monitor
card usually has no "On with you".

**Who can cover a shift.** A student can cover a role only if they could
do it themselves:
- **Gender:** Recycling is men only. Buckets & Composting and Lunch
  Monitor are women only. Shift Leader and Pots & Pans are anyone. Men's
  and women's roles therefore never cover each other.
- **Limits:** a student with roles under **Only does** covers only those.
  Ben Kong does Recycling only, so he's only ever a backup for Recycling.
- **Training:** Lunch Monitor is for trained students only, the ones
  with Lunch Monitor under **Trained for**. Lunch monitors cover each
  other's lunch shifts, and no one else can.

**The order.**
1. Everyone **not working that day** who can do the role, those with the
   fewest shifts first, then in alphabetical order.
2. Last of all, students **already working that day** in the role's
   **same-day backups**, in the order listed:
   - Pots & Pans and Shift Leader: Recycling, then Lunch Monitor at the
     very end.
   - Buckets & Composting: Lunch Monitor at the very end.
   - Recycling and Lunch Monitor: none.

   So Buckets & Composting and Pots & Pans never cover each other on the
   same day.

When this page was written, these rules reproduced the Student Kitchen
Manager's own hand-made lists exactly (`tests/expected-cover-lists.csv`).

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
