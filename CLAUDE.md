# Working in this repo

## Commit to `main`

Work goes on `main` and is pushed there, unless the user says otherwise in that
session. Don't open a pull request unless asked.

## What the project is

A quick-reference PWA for work study students on the kitchen cleanup crew.
It is a sibling of the Food as Medicine (`meal_program`) and Tea Brew Chart
(`tea`) apps. It uses the Ru-Yi tokens, type and card anatomy from the first
and the tab shell from the second.

- `index.html` is the whole app: markup, CSS and vanilla **ES5** in one
  file. No build step and no dependencies. There are four tabs, chosen by
  hash: `#shifts`, `#callout`, `#availability` and `#timesheet`. With
  four, the bottom bar's labels may take two lines.
- **The shift files** are `shifts.csv` (Student, Shift day, Role),
  `students.csv` (Student, Gender F/M, Trained for, and the optional
  Only does, Only covers, Covered only by same job) and `roles.csv`
  (Role, Work group, Covered as, Gender Any/Women only/Men only, Trained
  students only, Same-day backups). They are fetched, so the app must be
  served. **The app works out every cover list** (`buildData()`). **The
  specification is HANDOFF.md, "How the cover lists are worked out"
  (Groups A/B/C, the user's Rules 1–6, plus the settled
  contradictions).** Change that section, `buildData()` and
  `tests/expected_cover_lists.py` (an independent Python copy that writes
  `tests/expected-cover-lists.csv`, cover lists and swap options)
  together, and regenerate after any data change. In code terms: Rule 1
  is `role.cover`. `canDo()` is Rule 2. `canCover()` and `sameJobOnly`
  are Rule 3. `eligible()` adds Rule 4: free that day, or working that
  day in one of the job's same-day backups (the hours allow a double).
  `repay()` is the swap: the backup's shifts the asker is `eligible()`
  for, never on the covered day. Swaps are shift by shift; requiring
  every shift was rejected as overconstrained. Rule 5 is the order: free
  and repayable by tier, then the last resort from `s.lastFrom`: free but
  no swap, then same day. `s.swap[name]` lists the shifts. The hours are
  for understanding only: never show them in the app. Rules belong in
  the CSVs, never hard-coded.
- "Can cover for you" shows each backup as a bold name, then their swap
  options (`shiftsHTML()`, the shift's own job first), or all their
  shifts in the last resort: each role as a quiet label followed by day
  tags (`.dp`) in that day's hue. My availability groups as far as it
  goes: day covered (`li`), then "In exchange for your" one day of yours
  (`.ax`, from `s.swap[me]`), then the role you'd cover as (`.ar`), then
  the names (`.an`). A person who could take several of your shifts is
  under each. Anyone whose last resort you are is in a quiet "Last
  resort" group (`.ax.lr`) at the end of that day.
- The head of My shifts: the heading with the name beside it as a pill
  (`.who.set`: the select sits unseen over `#me-pill`; before a name is
  chosen it is a full-width labelled select). Under it, the week at a
  glance (`glance()`): "Today is …", then each shift by its next date
  (`nextDate()`), with the Today/Tomorrow pill. No shift count line. The
  page re-renders when the date changes (`newDay()`).
  **"Shift Leader" appears only in "On with you"** (listed first). The
  card header, the week at a glance, substitute lists and My availability
  all use the covered-as role (Pots & Pans). The user was explicit.
- "On with you" shows only the shift's own work group, and is left out
  when empty. Roles are shown as written ("Shift Leader"). Never
  highlight one. Role order on cards is `roles.csv` row order.
- Gender is for the rules only, never shown.
- The managers are named consistently everywhere: "Student Kitchen
  Manager" (never just "Kitchen Manager") and "Work Study Manager".
- **It is information, not a tool.** Each tab shows everything at once,
  phone first. Don't add toggles, in-card links or buttons, a whole-team
  view, phone numbers or call buttons, or a shift time. The user ruled
  these out. The exceptions the user asked for: each shift's backups
  are a closed `<details>` always titled "Shift Backups · N", with "Can
  cover for you" as body text above the list; and on Call out, a Copy
  message button under each message.
- **Call out** (`renderCallout()`) is the user's own procedure. Its
  readers are mostly young women whose first language is Chinese,
  Vietnamese, Thai or another Asian language, often in a panic. Write
  short, calm, everyday sentences, never a clipped flowchart.
  - **Jump list:** "What's happening?" has one button per situation
    (`.jump-b`, `data-jump`). It scrolls `#scroll`; it isn't a link, as
    the hash picks the tab. In the PDF the buttons link to their pages.
  - **Order:** "I can't make it today" (the most common: like too sick,
    with a `[my reason]` gap and a 10:00 am deadline), "Not sure if I can
    make it today", "I'm too sick to get out
    of bed" and "I forgot my shift, and it has already started" (Sick or
    Unplanned Absence), then "I will miss a shift in the future" (Planned
    Absence), then "Oh no! I missed my shift" (Missed Shift, in rust):
    message the Student Kitchen Manager and the Shift Leader, then wait
    for a make-up shift and **never** come in for another shift without
    approval. Situation titles are first person.
  - **Standalone:** each situation is written to be read alone (`sit()`).
  - **Times:** 10:30 am (not sure), 10:00 am (can't make it, too sick), 12:15 pm and
    12:40 pm (forgot), and 4 days ahead (planned). They are the user's
    and belong here; still never show shift hours elsewhere.
  - **Messages** (`MSG`) are always English. They fill in the student's
    name and the Student Kitchen Manager's name. The role is filled only
    for a student who only ever does one job (`myRole()`); otherwise it
    stays `[my role]`, as the message may be for another day. Anything
    else stays in `[brackets]`, marked, always first person (`[my name]`,
    `[my explanation]`). Messages to the Student Kitchen Manager say who
    cannot cover and who has not replied, separately, so they know who
    might still be found. No note sits above the messages, except "choose
    your name" when none is chosen.
  - Questions are gold diamonds (`.step.ask`).
- **Languages.** English, 简体中文, 繁體中文, ไทย and Tiếng Việt, all in
  `STR` in `index.html` and shown through `t()`; fixed page text carries
  `data-t`. A round language button (`[data-lang-btn]`) sits beside the
  appearance button and steps through them (`kitchen.lang`; absent means
  the phone's language if offered, else English). Names, roles (Pots &
  Pans, Shift Leader), the managers' titles, DRBU, the shift files' checks
  in the footer and every message students send stay in English. Write
  natural translations, never word for word, and keep every language's
  keys, `{names}`, tags and `[brackets]` the same as English's
  (`tests/data.test.js` checks). No italics in Chinese or Thai, and no
  letter-spacing in Thai. Vietnamese has its own font subsets.
- "My availability" is its own tab, between Call out and Submit
  Timesheet (the user moved it there from a sage band under the shift
  cards). Its head lead names the chosen student. The body has one card
  per day (`.avail-list li.panel`, topped in the day's hue like the shift
  cards), then a line to tell the Student Kitchen Manager (from the
  settings) if anything is wrong. Keep it short.
- Today/Tomorrow is a neutral pill beside the day name (`.when`, solid for
  today, outlined for tomorrow, `--mark-bg`/`--mark-fg`). Oxblood text
  above the day was tried and blended in.
- `settings.csv` (Setting, Value) holds what changes each year: the
  Student Kitchen Manager's name, the Work Study Manager's name and the
  timesheet portal link. It is fetched like the shift list.
  `applySettings()` matches rows by Setting text and reports problems in
  the footer. `CONFIG` in `index.html` only holds the defaults used if
  the file can't be read. Names only: no emails or phone numbers.
- **Handoff.** The app passes down each year between non-technical
  students who edit only the two CSV files on the GitHub website.
  `HOW-TO-UPDATE.md` is for whoever is receiving or looking after it.
  `HANDOFF.md` is for whoever is handing over, and holds the handover log
  and "How the cover lists are worked out". Both are written for any generation: name no
  particular person, and take the live links only from the top of the
  README. The intended lineage is a free GitHub organization with two
  owners (the Student Kitchen Manager and the Work Study Manager). Keep
  both in step with any change to the CSV formats, the settings, or what
  the footer checks. Anything that would need a successor to edit
  `index.html` belongs in `settings.csv` instead.
- The last tab, Submit Timesheet, gives the deadline (Sunday, 5 pm), a
  button to https://www.drbu.edu/timesheet, and a motto echoing Call
  out's: "It's not done until your hours are *submitted.*" On a Sunday its tab carries a "1"
  bubble until that button is pressed that day (`kitchen.timesheet` holds
  the date it was pressed).
- The service worker's self-update reloads open pages from **outside**
  `activate`'s `waitUntil`. A reload is a fetch the worker can't answer
  until activation finishes, so waiting on it inside deadlocks the app.
- It is an installable PWA. A file added to the app must also go in `SHELL`
  in `sw.js`. The page and the four CSVs are served network-first,
  and everything else cache-first. Bump `CACHE` in `sw.js` whenever
  `index.html` or `sw.js` changes: the new worker then reloads any page
  the old one left open, so no phone sticks on an old version.
- `icons/icon.svg` is the icon source. Re-render every PNG from it with
  Playwright, and never edit a PNG.
- The footer opens with "Every hour counts" (`.hours`), the line the
  user asked for: each shift must be done in full.
- The footer's **Save as PDF** button is the students' last-resort offline
  copy. It asks first in a `<dialog>` (`#pdf-dlg`; `confirm()` where there
  is none), then makes the PDF on the phone and downloads it, with no
  print window and no library (`buildPDF()`):
  - `pdfTabs()` copies the four tabs as they print (backups open, no
    Today/Tomorrow or dates, no role named "today"), plus the footer.
  - Each is laid out at 390px in a hidden iframe (`.snap`, the app's CSS
    without its `@media` blocks, fonts inlined).
  - Each page is drawn from an SVG `foreignObject` onto a canvas as a JPEG
    (390×844 pt, 2×). Each tab starts a page, and pages are cut at gaps
    between blocks (`PDF_BREAKS`, `pdfCuts()`).
  - A cover lists the tabs with page numbers; tapping a row jumps there.
  - `makePDF()` writes the file: link annotations (web addresses and
    pages) and bookmarks.
  - If drawing fails (a canvas the phone won't read back), the dialog says
    so and offers the print window, which uses the print styles
    (`forPrint()`). The print styles also serve the browser's own Print.
  - Never give the PDF cover a class an app element already uses (it once
    took `.cover`, the backup lists').
- The footer's Install as app button uses `beforeinstallprompt` where the
  browser offers it, and otherwise shows short instructions (iPhone:
  Share, then Add to Home Screen). It is hidden when running installed.
- The user's name is in `localStorage` under `kitchen.me`. Wrap every
  access in try/catch.

## The shell

- `.shell` is one viewport tall (`100dvh`), and only `.pane#scroll`
  scrolls. Nothing in the chrome is `position:fixed`.
- `.frame` needs `min-height:0`. Without it the bottom bar is pushed off
  screen.
- The tabs are drawn twice: as a bottom bar under 820px and as a top menu
  bar from 820px. The media query alone decides which shows.

## Look

- Each day has one hue (`k0` Mon … `k6` Sun). `--c` is the fill, `--ci`
  the ink for text, and `--cw` the wash. Never set an accent fill as text.
  Use its ink.
- Rust (`--rust`) is for fills. Use `--rust-deep` for rust text on light
  backgrounds.
- No shadows, no hover effects, no motion.
- Two modes, light and dark, set as `data-theme` on `<html>` by
  `window.kitchenTheme()` in a script in `<head>`, before the page paints.
  A round icon button (`[data-theme-btn]`, one per view head on phones and
  one in the menu bar from 820px) cycles Auto, Light and Dark (`kitchen.theme`; absent
  means Auto, which is dark from 7 pm to 7 am by the clock, not the
  system setting). Dark tokens are in `:root[data-theme="dark"]`. Use the
  tokens, never a raw colour. A fill under white text uses `--cf`/`-f` or
  `--rust-btn`, never an ink. Measure both modes.

## Verify before committing

Run both test files (README › Tests). `node tests/data.test.js` covers
every data function; `tests/app.e2e.js` covers every screen and the
service worker. Add checks for anything new. Then serve the repo root
(`python3 -m http.server`) and look with Playwright
(Chromium is preinstalled) at 320px, 375px and 1280px wide. Check the empty
name state, a chosen name with its backups closed and open, Call out and
Submit Timesheet. Watch for page errors and
sideways scroll, and confirm the tab bar sits inside the viewport. Measure any new colour pair against WCAG AA.
