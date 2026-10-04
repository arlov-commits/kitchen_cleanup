# Kitchen Cleanup 淨

> **Taking the app over, or looking after it?** Start with
> **[HOW-TO-UPDATE.md](HOW-TO-UPDATE.md)**. It covers changing the
> managers' names, the timesheet link and each semester's shift list. No
> code needed.
> **Handing it over to the next person?** Read **[HANDOFF.md](HANDOFF.md)**.
>
> **The app:** https://arlov-commits.github.io/kitchen_cleanup/
> **Its files:** https://github.com/arlov-commits/kitchen_cleanup
> **The cover-list maker:** https://arlov-commits.github.io/kitchen_cleanup/make-cover-lists.html
>
> *These links are the only place the guides take them from. Update
> them here if the app ever moves (see HANDOFF.md).*

A quick reference for work study students on the kitchen cleanup crew: your
shifts and who can cover them, what to do when you can't make a shift, and
where to submit your timesheet.

It's information, not a tool. Each tab shows everything at once. The only
thing to open is each shift's list of backups. It's written for phones
first.

It's built like the Food as Medicine and Tea Brew Chart apps: one
`index.html` with markup, CSS and vanilla ES5, no build step and no
dependencies. Served over the web, it installs as an app on a phone.

## The three tabs

| Tab | What it shows |
| --- | --- |
| **My shifts** | Choose your name from the list. The phone remembers it. Then, for each of your shifts: the day (with a **Today** or **Tomorrow** pill beside it when it is) and your role, and who else is on that day with their roles, the Shift Leader first and Buckets & Composting last. Under that, **Shift Backups** opens to show who can cover for you, numbered in the order to ask. At the foot, in a full-width sage band above the footer, **My availability** lists the days the student is a backup on, and for whom, with a line to email the Student Kitchen Manager (Art) if anything is wrong. |
| **Call out** | The substitute-replacement steps from the poster: **Planned Absence**, then **Sick or Unexpected Absence**, then **Afterward**, "It's not covered until someone says yes", and the contacts. |
| **Submit Timesheet** | The deadline, Sunday at 5 pm, and a button to the timesheet portal at drbu.edu/timesheet. On Sundays the tab shows a "1" bubble until the portal button is pressed that day (kept in `localStorage` as `kitchen.timesheet`). |

There are no phone numbers and no call buttons in the app.

The chosen name is kept in this browser only (`localStorage`, key
`kitchen.me`). To change it, pick a different name from the list.

## The shift list: `shift_cover_list.csv`

One row per shift, as exported from the spreadsheet:

| Column | What it is |
| --- | --- |
| `Student` | The student's name, written the same way everywhere. |
| `Gender` | `F` or `M`. Never shown in the app. It's only used to check the Buckets & Composting rule. |
| `Shift day` | `Monday` … `Sunday`. |
| `Role` | For example `Shift Leader`, `Pots & Pans` or `Buckets & Composting`. |
| `# who can cover` | How many names are in the next column. Used only as a check. |
| `Can be asked to cover (fewest shifts first)` | The names, comma-separated, in the order to ask them. |

The app shows the cover list **exactly as written**, in that order. It
doesn't work out who is free by itself. The lists are written by the
**cover-list maker**, which follows the rules in `makeCoverLists()`
(`kitchen.js`): everyone not working that day, fewest shifts first, ties
alphabetical, and women only for Buckets & Composting. Run on today's
schedule, it reproduces the shipped file byte for byte. "On with you" is everyone else who
has a row on the same day. Roles are shown exactly as written.

**Buckets & Composting is for women only.** Men are never put on it and
never listed to cover it.

The footer checks the file and names anything that looks wrong:
- a count that doesn't match its list;
- a name in a cover list that isn't a student, the shift's own student,
  or someone already working that day;
- a man on, or listed to cover, a Buckets & Composting shift;
- a missing or unrecognised gender, or one that differs between a
  student's rows;
- a student listed twice on one day (the second row is ignored);
- a student with fewer than 2 or more than 4 shifts.

The browser console shows the same warnings.

## The settings: `settings.csv`

The names and the link that change from year to year live in their own
small file, so whoever looks after the app never has to open
`index.html`:

```
Setting,Value
Student Kitchen Manager,Art
Work Study Manager,Nahelia
Timesheet portal link,https://www.drbu.edu/timesheet
```

Rows are matched by the Setting text, in any order. The footer flags an
empty name, a link that doesn't start with `https://`, an unknown or
missing row, or a file that can't be read. If the file can't be read, the
defaults in `CONFIG` in `index.html` are used. Names only: no emails or
phone numbers.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole app. |
| `shift_cover_list.csv` | The shifts, roles and cover lists. Read when the app opens. |
| `settings.csv` | The two managers' names and the timesheet portal link. Read when the app opens. |
| `kitchen.js` | The shift-list code shared by the app and the maker: reading the CSV, the checks, and the cover-list rules (`makeCoverLists()`). |
| `make-cover-lists.html` | The **cover-list maker**, for whoever looks after the app. Start from the current list or a spreadsheet, edit who works which day and role, read the checks, and download `shift_cover_list.csv` with every cover list written by the rules. Its work is saved on the device as `kitchen.maker`. It isn't linked from the app's tabs. |
| `HOW-TO-UPDATE.md` | For whoever is taking the app over or looking after it, written for someone who has never used GitHub. |
| `HANDOFF.md` | For whoever is handing it over: the steps, the handover log, the cover-list rules, and the one-time move into a shared organization. |
| `manifest.webmanifest`, `sw.js` | Make it installable and let it work offline. The page and the shift list are fetched fresh whenever there's a connection. When the app is updated (bump `CACHE` in `sw.js`), open copies reload themselves. |
| `fonts/` | Inter and Playfair Display, self-hosted, with their SIL Open Font Licenses. |
| `icons/` | `icon.svg` is the source. The PNGs are rendered from it. |

## Installing it

The footer has an **Install as app** button. In Chrome and Edge it opens
the browser's own install prompt. Safari on iPhone has no prompt, so there
the button explains how to add the app from the Share menu. The button is
hidden once the app is installed.

## Tests

```
node tests/data.test.js                          # the data functions, against the real files
NODE_PATH=$(npm root -g) node tests/app.e2e.js   # every screen in Chromium (needs Playwright)
```

`data.test.js` runs `kitchen.js` as is, and lifts the few functions that
live only in `index.html` out of it by name, so it always tests the code
that ships. `app.e2e.js` serves the repo and
drives the whole app:
- picking a name, the shift cards, backups and My availability;
- the cover-list maker: loading, editing, checks, the download (compared
  with the shipped file), drafts, spreadsheets, and layout;
- the tabs, the Sunday badge, settings and load errors;
- the theme button and Install as app;
- the layout at 320, 375 and 1280px in both modes;
- offline use, and the service worker reloading an open page when the
  app updates.

## Running it

The shift list is a separate file, so the app must be **served**, not
opened straight off the disk:

```
python3 -m http.server 8000    # then open http://localhost:8000
```

GitHub Pages serves it as it is.

## The look

The look is the Ru-Yi Style System, the same as Food as Medicine:
- white heads over a cool cream page, with plain white panels;
- Playfair Display headings with one italic word in deep rust;
- Inter for the body text;
- a near-black footer.

The tab shell is the Tea Brew Chart's: a tab bar at the foot on a phone,
and a menu bar across the top from 820px.

Each day of the week has its own colour, used on its heading and rule:
Mon rust, Tue teal, Wed violet, Thu green, Fri pink. The Call out paths
follow the poster: Planned in teal, Sick in orange, and Covered in green.
The 30-minute question is a gold diamond.

There are no shadows, no hover effects and no motion.

**Appearance.** A round icon button in the header cycles **Auto → Light →
Dark**, kept on the phone as `kitchen.theme`. It sits at the right of each
page's first line on a phone, and in the menu bar on a wide screen. The
icon shows the current mode: a half-filled circle for Auto, a sun for
Light, a moon for Dark. **Auto** is the default and goes by the
phone's clock: dark from 7 pm to 7 am, checked every minute and whenever
the app comes back on screen. Dark mode uses the same layout on a
blue-black ground. Text colours are lighter, and anything with white text
on it (the path headers, the portal button, the badge) keeps its
light-mode depth. Every text colour meets WCAG AA in both modes.
Every text colour meets WCAG AA.
