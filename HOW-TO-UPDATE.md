# Looking after the Kitchen Cleanup app

**For: whoever is taking the app over.** That's you if someone has just
handed it to you, usually because you're the new Student Kitchen Manager.

You don't need to know anything about code. You'll only ever change a few
small files, and each one works like a spreadsheet. When it's your turn to
hand over, **`HANDOFF.md`** tells you how.

**The app's links** are at the top of the **README**, the page GitHub
shows when you open the app's files. The person handing over will send you
the files link.

---

## What you can change, and where

| To change… | Edit this file |
| --- | --- |
| The Student Kitchen Manager's name | `settings.csv` |
| The Work Study Manager's name | `settings.csv` |
| The timesheet portal link | `settings.csv` |
| Who works which day, in which role | `shifts.csv` |
| Who the students are: gender, training, and any special limits | `students.csv` |
| The rules for each role: gender, training, work group, same-day backups (rarely) | `roles.csv` |

**You never write the cover lists.** The app works out who can cover each
shift from these files, by the rules in **"How the cover lists are worked
out"** in `HANDOFF.md`.

**Don't change any other file**, except to add a line to the handover log
in `HANDOFF.md`. Everything else is the app itself.

---

## 1. Make a GitHub account (once)

GitHub is the website that stores the app's files and puts the app online.
It's free.

1. Go to **https://github.com/signup**.
2. Enter your email address and click **Continue**.
3. Choose a password and click **Continue**.
4. Choose a username. Any name will do, for example `jane-kitchen`. Click
   **Continue**.
5. Do the short puzzle that checks you're a person.
6. GitHub emails you a code. Type it in.
7. If it asks questions about how you'll use GitHub, you can skip them.

**Send your username to the person handing over.** They'll invite you.

## 2. Accept the invitation (once)

1. Look for an email from GitHub inviting you to join an
   **organization**. It may take a few minutes, and it may go to your
   spam folder.
2. Click the button in the email, then **Join** (or **Accept**).

No email? Sign in to GitHub and open the files link you were sent. The
invitation shows there too.

The invitation runs out after 7 days. If it does, ask for a new one.

---

## 3. Change a manager's name or the timesheet link

This is a small change, made straight on the GitHub website.

1. Sign in to GitHub and open the app's files.
2. Click **settings.csv** in the list of files.
3. Click the **pencil icon** (✏️, "Edit this file") at the top right of
   the file.
4. You'll see something like this:

   ```
   Setting,Value
   Student Kitchen Manager,Art
   Work Study Manager,Nahelia
   Timesheet portal link,https://www.drbu.edu/timesheet
   ```

5. Change only the text **after the comma**. For example, put your own
   name after `Student Kitchen Manager,`.
   - Leave the words before the comma exactly as they are.
   - Don't put a comma inside a name.
   - The link must start with `https://`.
6. Click the green **Commit changes…** button. "Commit" is GitHub's word
   for "save".
7. A box opens. Click the green **Commit changes** button in it.

Then follow **5. Check that it worked**.

---

## 4. Put in a new semester's shifts

Do this at the start of each semester, or whenever the crew changes. The
app works out every cover list for you, so all you do is say who works
when, and who each student is.

### The three files

**`shifts.csv`**: one row for each shift. A student who works three days
has three rows.

| Column | What goes in it | Example |
| --- | --- | --- |
| **Student** | The student's name, spelled the same way everywhere | `Beth` |
| **Shift day** | The day, in full | `Wednesday` |
| **Role** | Exactly as it's written in `roles.csv` | `Pots & Pans` |

**`students.csv`**: one row for each student.

| Column | What goes in it | Example |
| --- | --- | --- |
| **Student** | Their name, spelled as in `shifts.csv` | `Ben Kong` |
| **Gender** | `F` or `M`. It's never shown in the app. | `M` |
| **Trained for** | Any roles that need training (see `roles.csv`), separated by `;` | `Lunch Monitor` |
| **Only does** | Leave blank, unless the student can only work certain roles. Then list them, separated by `;` | `Recycling` |
| **Only covers** | Leave blank, unless the student can only substitute for certain roles. Then list them, separated by `;`, or write `None` | `Recycling` |
| **Covered only by same job** | Leave blank, unless only students who do the same job may cover this student's shifts. Then write `Yes` | `Yes` |

The last three are for special students and are blank for almost
everyone. Ben Kong, for example, has `Recycling`, `Recycling`, `Yes`: he
works and covers Recycling only, and only Recycling students cover him.

**`roles.csv`**: the rules for each role. You'll rarely need to change it.
See **"Changing a rule"** below.

### Step by step, with Google Sheets

Do this for each file you change, usually `shifts.csv`, and
`students.csv` when someone joins or leaves.

**a) Download the current file. This is also your backup.**
1. On GitHub, click the file, for example **shifts.csv**.
2. Click the **download icon** ("Download raw file") at the top right.
3. Keep it. If anything goes wrong, upload it again to put things back.

**b) Open it in Google Sheets.**
1. Go to **https://sheets.google.com** and start a **Blank** spreadsheet.
2. **File → Import → Upload**, and choose the file.
3. Choose **Replace spreadsheet**, then **Import data**.

**c) Make your changes.**
- Keep the first row (the column names) exactly as it is.
- Someone left: delete their rows in `shifts.csv` and their row in
  `students.csv`.
- Someone new: add a row in `students.csv`, and a row in `shifts.csv` for
  each day they work.
- Don't leave empty rows in the middle.

**d) Download it as CSV.**
1. **File → Download → Comma Separated Values (.csv)**.
2. **Rename the download to exactly the original name**, such as
   `shifts.csv`. Google adds words to it, for example `Untitled
   spreadsheet - shifts.csv`. The app only reads the exact name.

**e) Upload it to GitHub.**
1. Open the app's files and click **Add file → Upload files**.
2. Drag in your file, or click **choose your files**. You can upload
   several files at once.
3. Click the green **Commit changes** button. Files with the same name are
   replaced.

> **Using Excel instead?** **File → Save As**, type **CSV UTF-8 (Comma
> delimited)**. Then upload the same way.

### A small fix, such as a misspelled name

Do it straight on GitHub, as in step 3: open the file, click the
**pencil icon**, fix the text, and commit. If you rename a student, change
their name in **both** `shifts.csv` and `students.csv`.

### Changing a rule

`roles.csv` has one row for each role:

| Column | What it means | Choices |
| --- | --- | --- |
| **Role** | The role's name, as used in the other files | |
| **Work group** | Roles in the same group work side by side. "On with you" shows only your own group, and backups from the same group are asked before other groups. | for example `Dishwashing`, `Recycling`, `Lunch Monitors` |
| **Covered as** | Leave blank, unless the role counts as a different one. Shift Leader is covered as Pots & Pans: the app calls it Pots & Pans everywhere except "On with you". | for example `Pots & Pans` |
| **Gender** | Who can do it, and so who can cover it | `Any`, `Women only` or `Men only` |
| **Trained students only** | `Yes` means only students with this role under **Trained for** can do or cover it | `Yes` or `No` |
| **Same-day backups (asked last)** | Roles whose students, even when already working that day, can cover this role because the hours allow both. They're asked only after everyone else, in the order listed, separated by `;`. A role that's **Covered as** another uses that role's list instead. | for example `Recycling; Lunch Monitor` |

For example:
- To let anyone do Recycling, change its **Gender** to `Any`.
- To limit a student to two roles, put both under **Only does** in
  `students.csv`, for example `Pots & Pans; Shift Leader`.
- To keep a student off every cover list, put `None` under **Only
  covers**.
- To train someone as a lunch monitor, add `Lunch Monitor` under their
  **Trained for**.

The row order in `roles.csv` is also the order roles appear on the cards.

## 5. Check that it worked

1. **Wait about 2 minutes.** GitHub needs a moment to put the new version
   online. To watch it, click the **Actions** tab on GitHub. A green tick ✅
   means it's done.
2. Open the app. If it's installed on your phone, close it fully and
   open it again.
3. **Scroll to the very bottom.** The dark footer says something like
   *"Shift list: 17 students, 41 shifts a week."*
   - If that's all it says, everything is fine.
   - If there's **yellow text starting "Check…"**, it tells you what to
     fix. For example: *"Bethh isn't in students.csv"*, *"Beth has 1
     shift (expected 2 to 4)"*, *"shifts.csv line 5: Adam can't do Buckets
     & Composting"*, *"'Mopping' isn't a role in roles.csv"*, or *"The
     timesheet portal link should start with https://"*. Fix the file and
     upload it again.
4. Choose a student's name and check that their shifts look right.

If the app says **"The shift list didn't load"**, a file's name is
probably wrong. The message names the file. The files must be called
exactly `shifts.csv`, `students.csv` and `roles.csv`. Upload it again with
the right name, or upload your backup.

---

## 6. If something goes wrong

- **Undo:** upload the backup you downloaded in 4a, the same way as in
  4e.
- **Stuck:** ask the other owner (the Work Study Manager, or the Student
  Kitchen Manager if that's not you), or the person who handed over to
  you. GitHub keeps every earlier version of every file, so nothing is
  ever lost.

---

## 7. When it's your turn to hand over

Open **`HANDOFF.md`**. It's written for you then: how to give the next
person access, what to go through with them, and what to add to the
handover log. Then send them the files link and point them to this page.

---

## Something else needs changing

These are part of the app itself, so they're not in the two files:
- the wording on the Call out steps;
- the tab names;
- the timesheet deadline (Sunday, 5 pm);
- the colours.

Ask someone comfortable with code to change them. If they use an AI
coding assistant, such as Claude Code, the repository includes
instructions for it in `CLAUDE.md`.
