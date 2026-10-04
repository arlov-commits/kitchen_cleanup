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
  file. No build step and no dependencies. There are three tabs, chosen by
  hash: `#shifts`, `#callout` and `#timesheet`.
- `shift_cover_list.csv` is the shift data, exported from the user's
  spreadsheet: `Student`, `Shift day`, `Role`, `# who can cover`, and
  `Can be asked to cover (fewest shifts first)`. It is **fetched**, so
  the app must be served. The cover list is curated: show it exactly as
  written and in that order, and never work out cover from who is free.
  "On with you" is the other rows on the same day, Shift Leader first and
  Buckets & Composting last. The list says "Student Leader"; the app shows
  "Shift Leader" (`roleName()`), never highlighted.
- **It is information, not a tool.** Each tab shows everything at once,
  phone first. Don't add toggles, in-card links or buttons, a whole-team
  view, phone numbers or call buttons, or a shift time. The user ruled
  these out. The one exception the user asked for: each shift's backups
  are a closed `<details>` titled "Shift Backups" that reads "Can cover
  for you" when open.
- `CONFIG` at the top of the script holds the contacts (names and emails
  only). A `[BRACKETED]` value is a placeholder.
- The third tab, Submit Timesheet, gives the deadline (Sunday, 5 pm) and
  a button to https://www.drbu.edu/timesheet.
- It is an installable PWA. A file added to the app must also go in `SHELL`
  in `sw.js`. The page and `shift_cover_list.csv` are served network-first,
  and everything else cache-first. Bump `CACHE` in `sw.js` whenever
  `index.html` or `sw.js` changes: the new worker then reloads any page
  the old one left open, so no phone sticks on an old version.
- `icons/icon.svg` is the icon source. Re-render every PNG from it with
  Playwright, and never edit a PNG.
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

## Verify before committing

Serve the repo root (`python3 -m http.server`) and check with Playwright
(Chromium is preinstalled) at 320px, 375px and 1280px wide. Check the empty
name state, a chosen name with its backups closed and open, Call out and
Submit Timesheet. Watch for page errors and
sideways scroll, and confirm the tab bar sits inside the viewport. Measure any new colour pair against WCAG AA.
