# Handing off the Kitchen Cleanup app

**For:** the person who looks after the app now and is handing it to the
next Student Kitchen Manager or Work Study Manager. The everyday steps
(changing names, putting in a new shift list) are in
**`HOW-TO-UPDATE.md`**. Give that page to the next person. This page
covers the handover itself.

---

## What changes from year to year

| What | Where | Who can change it |
| --- | --- | --- |
| Students, shift days, roles, cover lists | `shift_cover_list.csv` | Whoever looks after the app, using `HOW-TO-UPDATE.md` |
| Student Kitchen Manager's name | `settings.csv` | Same |
| Work Study Manager's name | `settings.csv` | Same |
| Timesheet portal link | `settings.csv` | Same |
| Anything else (wording, deadline, layout) | `index.html` | Someone comfortable with code |

The app reads both CSV files each time it opens, and installed copies
update by themselves. No other file needs touching for an ordinary
handover.

---

## The one decision: where the app lives

The app currently lives in a personal GitHub account
(`arlov-commits`), at:

- the app: https://arlov-commits.github.io/kitchen_cleanup/
- the files: https://github.com/arlov-commits/kitchen_cleanup

There are three ways to hand it on:

| | How it works | The app's link | Can the next person hand it on by themselves? |
| --- | --- | --- | --- |
| **A. Move it to a shared organization** (recommended) | Create a free GitHub organization, for example `drbu-kitchen`, and move the app into it. Each year the outgoing manager makes the incoming one an owner. | Changes **once**, to `https://drbu-kitchen.github.io/kitchen_cleanup/`, then stays the same every year. | **Yes** |
| **B. Keep it here and add them as a collaborator** | The app stays in the personal account. You invite the next person, and they can edit the files. | Never changes | **No.** Only the account owner can invite people or change settings, so every future handover needs the owner. |
| **C. Transfer it to the next person's account** | The app moves to their personal account. | Changes **every year** | Yes, but students must get a new link each time. |

**Recommendation: A.** Do it before the semester when students first
install the app, so the one link change happens before anyone relies on
it. Old links don't forward: GitHub Pages doesn't redirect after a move.
Anyone with the old link, or the app installed from it, will need the new
one.

### A. Move it to an organization

1. Sign in to GitHub. Go to **https://github.com/organizations/plan** and
   choose the **Free** plan.
2. Name it, for example `drbu-kitchen`. The name becomes part of the app's
   link. Give your email, choose **My personal account**, and finish.
   You can skip inviting people for now.
3. Open the app's files (https://github.com/arlov-commits/kitchen_cleanup)
   and go to **Settings**. Scroll to the bottom, to the **Danger Zone**, and
   click **Transfer**.
4. Choose the organization, type the names it asks for, and confirm.
5. In the moved repository, go to **Settings → Pages**. Under **Build and
   deployment**, set **Source** to **Deploy from a branch**, choose
   **main** and **/ (root)**, and click **Save**.
6. After a minute or two, the app is at
   `https://<organization>.github.io/kitchen_cleanup/`. Open it and check
   that it works.
7. Change the two links at the top of `HOW-TO-UPDATE.md` to the new ones.
8. Tell students the new link.

**At each handover:** the next person makes a GitHub account
(`HOW-TO-UPDATE.md`, step 1). In the organization, go to **People →
Invite member**, enter their username, and choose the **Owner** role. Once
they've accepted, the outgoing person can leave the organization. Keep at
least two owners while you overlap, so it's never left without one.

### B. Add them as a collaborator

1. Open the app's files and go to **Settings → Collaborators** (it may be
   under "Collaborators and teams"). GitHub may ask for your password.
2. Click **Add people**, enter their GitHub username, and send the
   invitation.
3. They accept it (`HOW-TO-UPDATE.md`, step 2). Invitations run out after
   7 days.

They can now edit `settings.csv` and `shift_cover_list.csv`. They can't
invite the person after them. The account owner has to.

### C. Transfer to their account

The same as A, steps 3 to 8, but choose their username instead of an
organization. Pages must be turned on again (step 5), and the link
becomes `https://<their-username>.github.io/kitchen_cleanup/`.

---

## Handover checklist

Plan about 30 minutes together, with their laptop and phone.

- [ ] They make a GitHub account (`HOW-TO-UPDATE.md`, step 1) and tell
      you their username.
- [ ] You give them access: A (organization owner) or B (collaborator).
- [ ] They accept the invitation (step 2).
- [ ] **Practice run:** they change the Student Kitchen Manager's name in
      `settings.csv` to their own (step 3), then check the app (step 5).
- [ ] If the crew is changing, they put in the new shift list (step 4)
      while you watch, and check the footer has no yellow "Check…" text.
- [ ] Tell them who isn't asked to cover Buckets & Composting shifts, and
      why, so they can build the cover lists the same way. Add it to the
      Buckets note in `HOW-TO-UPDATE.md` if it's useful.
- [ ] They install the app on their phone: **Install as app** at the
      bottom of the app.
- [ ] Give them `HOW-TO-UPDATE.md`. It's also on the app's files page on
      GitHub.
- [ ] If you used B, remember that you'll be needed for the next handover.

---

## After you leave

- If you chose A, you can leave the organization once the new owner is
  set up.
- If you chose B, stay reachable. Only you can add the person after them.
- Nothing needs renewing. GitHub hosting for a public repository is free,
  and the app has no accounts, passwords or servers to look after.
