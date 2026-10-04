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
  hash: `#shifts`, `#callout` and `#policies`. In-page jumps (`data-jump`)
  scroll the pane and don't touch the hash, because the hash names the tab.
- `roster.csv` is the shift mapping. It is **fetched**, so unlike the meal
  app this one needs to be served, and over `file://` My shifts shows a
  message. Columns: `name` (required, unique), `phone` (optional), then
  one column per day (`Mon`…`Sun`, matched on the first three letters).
  A blank day cell means not working. `buildRoster()` checks the rows and
  the footer reports any problems.
- Backups for a day are everyone not working that day. Don't add any other
  rule without asking.
- `CONFIG` at the top of the script holds the shift time and the two
  managers' contacts. A value that is still `[BRACKETED]` is shown as a
  placeholder, never as a link.
- The Policies tab is **placeholder sample text** until the user supplies
  the real policies. Keep the "Sample text" notice until then.
- It is an installable PWA. A file added to the app must also go in `SHELL`
  in `sw.js`. The page and `roster.csv` are served network-first, and
  everything else cache-first.
- `icons/icon.svg` is the icon source. Re-render every PNG from it with
  Playwright, and never edit a PNG.
- The user's name is in `localStorage` under `kitchen.me`, and the chosen
  call-out path under `kitchen.path`. Wrap every access in try/catch.

## The shell

- `.shell` is one viewport tall (`100dvh`), and only `.pane#scroll`
  scrolls. Nothing in the chrome is `position:fixed`.
- `.frame` needs `min-height:0`. Without it the bottom bar is pushed off
  screen.
- The tabs are drawn twice: as a bottom bar under 820px and as a top menu
  bar from 820px. The media query alone decides which shows.

## Look

- Each day has one hue (`k0` Mon … `k6` Sun) everywhere it appears.
  `--c` is the fill, `--ci` the ink for text and filled chips, and `--cw`
  the wash. Never set an accent fill as text. Use its ink.
- Rust (`--rust`) is for fills. Use `--rust-deep` for rust text on light
  backgrounds.
- No entrance motion. Hover effects only under `@media (hover:hover)`.

## Verify before committing

Serve the repo root (`python3 -m http.server`) and check with Playwright
(Chromium is preinstalled) at 320px, 375px and 1280px wide. Check the name
picker, a chosen name, Call out (phone toggle and desktop side-by-side) and
Policies. Watch for page errors and sideways scroll, and confirm the tab bar
sits inside the viewport. Measure any new colour pair against WCAG AA.
