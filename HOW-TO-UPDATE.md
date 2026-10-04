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
| Which students are on the crew, their shift days and roles, and who can cover each shift | `shift_cover_list.csv`, made with the **cover-list maker** (step 4) |

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

Do this at the start of each semester, or whenever the crew changes. You
**never write the cover lists yourself**. The **cover-list maker** writes
them for you. Its link is at the top of the README (it's the app's link
with `make-cover-lists.html` on the end). A laptop is easiest.

### a) Open the maker and start from the current list

1. Open the cover-list maker.
2. Under **1. Start from**, click **The current list**. Every shift
   appears as a line under **2. The shifts**.

The maker saves your work on that device as you go, so you can close it
and come back later.

### b) Change the lines

Each line is one shift: **Student**, **Gender** (F or M), **Day** and
**Role**. A student who works three days has three lines.
- **Someone left:** click **×** on each of their lines.
- **Someone new:** click **+ Add a shift** for each day they work, and
  fill in the line. Spell their name the same way every time.
- **Someone changed days or roles:** change the Day or Role on their line.

Gender is only used for the Buckets & Composting rule: it's for women
only, so the maker never lists a man to cover it. Gender never appears in
the app.

### c) Read the checks

Under **3. Checks**:
- **Fix** (red) means something is wrong, for example a line with no day,
  or a man on Buckets & Composting. The download stays switched off until
  you've fixed it.
- **Check** (yellow) is worth a look but won't stop you, for example *"Kim
  has 1 shift"* or *"Saturday has no Shift Leader"*.
- **OK** means everything is fine.

Under **4. The cover lists** you can read every shift's list before you
download.

### d) Download and upload

1. Click **Download shift_cover_list.csv**.
2. On GitHub, open the app's files and click **Add file → Upload files**.
3. Drag the downloaded file onto the page, or click **choose your files**
   and pick it.
   - The name must be exactly `shift_cover_list.csv`. If your computer
     added something, such as `shift_cover_list (1).csv`, rename it first.
4. Click the green **Commit changes** button. It replaces the old file.

Then follow **5. Check that it worked**.

> **Before a big change, keep a backup.** On GitHub, click
> **shift_cover_list.csv**, then the **download icon** ("Download raw
> file"). If anything goes wrong, upload that file again.

### Prefer a spreadsheet?

You can keep the shifts in Google Sheets or Excel instead. You only need
four columns: **Student**, **Gender**, **Shift day** and **Role**. Then:
1. In Google Sheets: **File → Download → Comma Separated Values (.csv)**.
   In Excel: **File → Save As**, type **CSV UTF-8 (Comma delimited)**.
2. In the maker, click **A spreadsheet file (.csv)** and choose it.
3. Carry on from **c)** above.

### A small fix, such as a misspelled name

The easiest way is in the maker: start from the current list, fix the
name on each of that student's lines, then download and upload as in
**d)**. Their name in other people's cover lists is fixed at the same
time.

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

- **Undo:** upload the backup file you downloaded (step 4, "keep a
  backup"), the same way as in step 4 d).
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
