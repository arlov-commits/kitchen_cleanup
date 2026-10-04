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
  are a closed `<details>` always titled "Shift Backups · N", with "Can
  cover for you" as body text above the list.
- Under the shift cards, "My availability" lists the days the student
  appears in someone's cover list, and for whom, then a line to tell the
  Student Kitchen Manager (from the settings) if anything is wrong.
  It is a full-width band (`.band`, `--band`) between the cards and the
  footer: soft sage in light mode and deep sage in dark mode, distinct from
  the page and the footer. Days are in ink with a dot in their hue. Sand
  and brown were tried and rejected. Keep it short.
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
  and the cover-list rules. Both are written for any generation: name no
  particular person, and take the live links only from the top of the
  README. The intended lineage is a free GitHub organization with two
  owners (the Student Kitchen Manager and the Work Study Manager). Keep
  both in step with any change to the CSV formats, the settings, or what
  the footer checks. Anything that would need a successor to edit
  `index.html` belongs in `settings.csv` instead.
- The third tab, Submit Timesheet, gives the deadline (Sunday, 5 pm) and
  a button to https://www.drbu.edu/timesheet. On a Sunday its tab carries a "1"
  bubble until that button is pressed that day (`kitchen.timesheet` holds
  the date it was pressed).
- It is an installable PWA. A file added to the app must also go in `SHELL`
  in `sw.js`. The page and `shift_cover_list.csv` are served network-first,
  and everything else cache-first. Bump `CACHE` in `sw.js` whenever
  `index.html` or `sw.js` changes: the new worker then reloads any page
  the old one left open, so no phone sticks on an old version.
- `icons/icon.svg` is the icon source. Re-render every PNG from it with
  Playwright, and never edit a PNG.
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

Serve the repo root (`python3 -m http.server`) and check with Playwright
(Chromium is preinstalled) at 320px, 375px and 1280px wide. Check the empty
name state, a chosen name with its backups closed and open, Call out and
Submit Timesheet. Watch for page errors and
sideways scroll, and confirm the tab bar sits inside the viewport. Measure any new colour pair against WCAG AA.
