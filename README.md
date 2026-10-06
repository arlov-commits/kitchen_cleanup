# Kitchen Cleanup 淨

> **Taking the app over, or looking after it?** Start with
> **[HOW-TO-UPDATE.md](HOW-TO-UPDATE.md)**. It covers changing the
> managers' names, the timesheet link and each semester's shift list. No
> code needed.
> **Handing it over to the next person?** Read **[HANDOFF.md](HANDOFF.md)**.
>
> **The app:** https://arlov-commits.github.io/kitchen_cleanup/
> **Its files:** https://github.com/arlov-commits/kitchen_cleanup
>
> *These two links are the only place the guides take them from. Update
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

## The four tabs

| Tab | What it shows |
| --- | --- |
| **My shifts** | Choose your name from the list. The phone remembers it, and shows it as a small pill beside the heading. Under the heading, **the week at a glance**: today's date, then each of your shifts by the next date it falls on, with a **Today** or **Tomorrow** pill. Then, for each of your shifts: the day (with the same pill) and your job, and who else from your work group is on that day, with their roles, in `roles.csv` order (left out when no one else in your group is on). Under that, **Shift Backups** opens to show who can cover for you, numbered in the order to ask. |
| **Call out** | The substitute-replacement steps from the poster: **Planned Absence**, then **Sick or Unexpected Absence**, then **Afterward**, "It's not covered until someone says yes", and the contacts. |
| **My availability** | The days the chosen student is a backup on, one card per day in its colour, grouped by the day, the shift of theirs taken in exchange, the job, then who, with a line to email the Student Kitchen Manager (Art) if anything is wrong. |
| **Submit Timesheet** | The deadline, Sunday at 5 pm, a button to the timesheet portal at drbu.edu/timesheet, and "It's not done until your hours are submitted". On Sundays the tab shows a "1" bubble until the portal button is pressed that day (kept in `localStorage` as `kitchen.timesheet`). |

There are no phone numbers and no call buttons in the app.

The chosen name is kept in this browser only (`localStorage`, key
`kitchen.me`). To change it, pick a different name from the list.

## The shift files

The app reads three files and works out every cover list itself. Nobody
types the lists.

| File | One row per | Columns |
| --- | --- | --- |
| `shifts.csv` | shift | Student, Shift day, Role |
| `students.csv` | student | Student, Gender (F/M, never shown), Trained for (`;`-separated), and for special students: Only does (the roles they can work), Only covers (the roles they can substitute for, or `None`), Covered only by same job (`Yes`). Blank = no limit. The last three columns are optional. |
| `roles.csv` | role, in card order | Role, Work group, Covered as (optional: Shift Leader → Pots & Pans), Gender (Any / Women only / Men only), Trained students only (Yes/No), Same-day backups (asked last, `;`-separated, in order) |

**A cover list** follows the numbered rules in HANDOFF.md, "How the cover
lists are worked out": the groups (A Lunch Monitors, B Dishwashing, C
Recycling) and Rules 1 to 6. That section is the specification: the code
and the tests follow it. In short:
- **main list:** people not working that day who can cover the job, and
  have at least one shift you could take back on another day. They come
  in tiers: same job, same work group, other group; each fewest shifts
  first, then A–Z;
- **boxed last resort:** those you can't swap with, then those working
  that day in one of the job's same-day backups from `roles.csv`, where
  the hours allow both (Lunch Monitor last).

A Shift Leader shift counts as Pots & Pans everywhere except **On with
you**, which shows only the shift's own work group. Backup lines show the
swap options. **My availability** groups by your day in exchange.

The footer checks all three files and names anything that looks wrong:
- a missing column, or a role or student that isn't defined;
- a student who can't do their own role (gender, Only does, training);
- a bad gender or yes/no value, or a role or student listed twice;
- a student twice on one day (the second row is ignored);
- a student with fewer than 2 or more than 4 shifts, or in
  `students.csv` with no shifts.

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
| `shifts.csv`, `students.csv`, `roles.csv` | The shift files: who works when, who the students are, and the role rules. The app works out the cover lists from them. |
| `settings.csv` | The two managers' names and the timesheet portal link. Read when the app opens. |
| `HOW-TO-UPDATE.md` | For whoever is taking the app over or looking after it, written for someone who has never used GitHub. |
| `HANDOFF.md` | For whoever is handing it over: the steps, the handover log, how the cover lists are worked out, and the one-time move into a shared organization. |
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

`data.test.js` lifts each data function out of `index.html` by name, so
it always tests the code that ships. It checks every cover list and swap
option against `tests/expected-cover-lists.csv`, which
`tests/expected_cover_lists.py` writes from the same three files with a
separate Python copy of the rules (run `python3
tests/expected_cover_lists.py` after changing a shift file or a rule). It
then flips each setting in `roles.csv` and `students.csv` to see that the
lists change as they should. `app.e2e.js` serves the repo and drives the
whole app:
- picking a name, the week at a glance, the shift cards, work groups,
  backups, and the My availability tab;
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
the app comes back on screen. The dates, Today and Tomorrow move on at
midnight the same way. Dark mode uses the same layout on a
blue-black ground. Text colours are lighter, and anything with white text
on it (the path headers, the portal button, the badge) keeps its
light-mode depth. Every text colour meets WCAG AA in both modes.
