# Looking after the Kitchen Cleanup app

**For: whoever is taking the app over.** That's you if someone has just
handed it to you, usually because you're the new Student Kitchen Manager.

You don't need to know anything about code. You'll only ever change **two
files**, and both work like a small spreadsheet. When it's your turn to
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
| Which students are on the crew, their shift days and roles, and who can cover each shift | `shift_cover_list.csv` |

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

## 4. Put in a new semester's shift list

Do this at the start of each semester, or whenever the crew changes.

### What's in the file

`shift_cover_list.csv` has **one row for each shift**. A student who
works three days has three rows. The columns are:

| Column | What goes in it | Example |
| --- | --- | --- |
| **Student** | The student's name. Spell it the same way every time it appears. | `Beth` |
| **Gender** | `F` or `M`. It's never shown in the app. It's only used to check the Buckets & Composting rule. Use the same letter on every row for that student. | `F` |
| **Shift day** | The day of the week, in full. | `Wednesday` |
| **Role** | Their job on that shift. | `Shift Leader`, `Pots & Pans` or `Buckets & Composting` |
| **# who can cover** | How many names are in the last column. | `8` |
| **Can be asked to cover (fewest shifts first)** | The students who can cover this shift, separated by commas, in the order they should be asked. | `Adam, Amelia, Huiyi, Ivwananji` |

The app shows each role exactly as you write it.

**Making each cover list:** follow the **Cover-list rules** in
`HANDOFF.md`. The person who handed over to you will have gone through
them with you. In short:
- list the students who **don't** work that day;
- put those with the **fewest shifts first**;
- **Buckets & Composting is for women only**: never put a man on it, and
  never list a man to cover it.

If you get any of this wrong, the yellow "Check…" note at the bottom of
the app will say so (see step 5).

The app builds everything else from these rows: the list of names to
choose from, "On with you", and "My availability".

### The easiest way: Google Sheets

**a) Download the current file. This is also your backup.**

1. On GitHub, click **shift_cover_list.csv**.
2. Click the **download icon** ("Download raw file") at the top right of
   the file.
3. Keep this file. If anything goes wrong, you can upload it again to put
   things back.

**b) Open it in Google Sheets.**

1. Go to **https://sheets.google.com** and start a **Blank** spreadsheet.
2. Click **File → Import → Upload**, and choose the file you downloaded.
3. Under "Import location", choose **Replace spreadsheet**. Click
   **Import data**.

**c) Make your changes.**

- Keep the first row (the column names) exactly as it is.
- One row per shift. Delete the rows for students who have left, and add
  rows for new ones.
- Don't leave empty rows in the middle.

**d) Download it as a CSV file.**

1. Click **File → Download → Comma Separated Values (.csv)**.
2. **Rename the downloaded file to exactly `shift_cover_list.csv`.**
   Google gives it a longer name, such as
   `Untitled spreadsheet - shift_cover_list.csv`. The app only reads a file
   with exactly the right name.

**e) Upload it to GitHub.**

1. Open the app's files on GitHub.
2. Click **Add file → Upload files**.
3. Drag your `shift_cover_list.csv` onto the page, or click **choose your
   files** and pick it.
4. Click the green **Commit changes** button.

Because the name is the same, it replaces the old file.

> **Using Excel instead?** Save with **File → Save As**, and choose
> **CSV UTF-8 (Comma delimited)** as the type. Then upload it the same way.

### A small fix, such as a misspelled name

You can do this straight on GitHub, as in step 3. Open
`shift_cover_list.csv`, click the **pencil icon**, fix the text, and commit.
Each cover list is inside "quote marks". Keep the quote marks.

---

## 5. Check that it worked

1. **Wait about 2 minutes.** GitHub needs a moment to put the new version
   online. To watch it, click the **Actions** tab on GitHub. A green tick ✅
   means it's done.
2. Open the app. If it's installed on your phone, close it fully and
   open it again.
3. **Scroll to the very bottom.** The dark footer says something like
   *"Shift list: 14 students, 30 shifts a week."*
   - If that's all it says, everything is fine.
   - If there's **yellow text starting "Check…"**, it tells you what to
     fix. For example: *"Beth has 1 shift (expected 2 to 4)"*, *"'Bethh'
     isn't a student on the list"*, *"Adam is in Nita's Tuesday cover list,
     but Buckets & Composting is for women only"*, or *"The timesheet
     portal link should start with https://"*. Fix the file and upload it
     again.
4. Choose a student's name and check that their shifts look right.

If the app says **"The shift list didn't load"**, the file's name is
probably wrong. It must be exactly `shift_cover_list.csv`. Upload it again
with the right name, or upload your backup.

---

## 6. If something goes wrong

- **Undo:** upload the backup file you downloaded in 4a, the same way
  as in 4e.
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
