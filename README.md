# Kitchen Cleanup 淨

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
| **My shifts** | Choose your name from the list. The phone remembers it. Then, for each of your shifts: the day (marked **Today** or **Tomorrow** in oxblood when it is) and your role, and who else is on that day with their roles, the Shift Leader first and Buckets & Composting last. Under that, **Shift Backups** opens to show who can cover for you, numbered in the order to ask. At the foot, in its own section, **My availability** lists the days the student is a backup on, and for whom. |
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
| `Shift day` | `Monday` … `Sunday`. |
| `Role` | For example `Pots & Pans`, `Buckets & Composting` or `Student Leader`. |
| `# who can cover` | How many names are in the next column. Used only as a check. |
| `Can be asked to cover (fewest shifts first)` | The names, comma-separated, in the order to ask them. |

The app shows the cover list **exactly as written**, in that order. It
doesn't work out who is free by itself. "On with you" is everyone else who
has a row on the same day. The file says "Student Leader", and the app
shows it as "Shift Leader".

The footer checks the file and names anything that looks wrong:
- a count that doesn't match its list;
- a name in a cover list that isn't a student;
- a student listed twice on one day;
- a student with fewer than 2 or more than 4 shifts.

The browser console shows the same warnings.

## The contacts

These are in `CONFIG`, near the top of the `<script>` in `index.html`:

```js
var CONFIG = {
  contacts: [
    { role: "Student Kitchen Manager", name: "Art" },
    { role: "Work Study Manager", name: "Nahelia" }
  ]
};
```

Names and roles only: no emails or phone numbers.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole app. |
| `shift_cover_list.csv` | The shifts, roles and cover lists. Read when the app opens. |
| `manifest.webmanifest`, `sw.js` | Make it installable and let it work offline. The page and the shift list are fetched fresh whenever there's a connection. When the app is updated (bump `CACHE` in `sw.js`), open copies reload themselves. |
| `fonts/` | Inter and Playfair Display, self-hosted, with their SIL Open Font Licenses. |
| `icons/` | `icon.svg` is the source. The PNGs are rendered from it. |

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
Every text colour meets WCAG AA.
