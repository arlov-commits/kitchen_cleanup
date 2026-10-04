# Kitchen Cleanup 淨

A quick reference for work study students on the kitchen cleanup crew. Each
student picks their name once, and the app shows their shifts, who is on
with them, and who can cover. It also has the call-out steps for a missed
shift and the kitchen's cleanup policies.

Built like the Food as Medicine and Tea Brew Chart apps: one `index.html`
with markup, CSS and vanilla ES5, no build step and no dependencies. Served
over the web, it installs as an app on a phone.

## The three tabs

| Tab | What it shows |
| --- | --- |
| **My shifts** | First visit: a list of names to tap. After that: the next shift, the week (your days filled in their colour, today ringed), and a card for each of your days showing who is on with you and who can cover (anyone not already working that day), each with a **Call** button. At the bottom is the whole team's week. |
| **Call out** | The substitute-replacement steps from the poster, as two paths, **Planned** and **Sick or unexpected**. On a phone a toggle picks one path; on a wide screen both are shown side by side. The "call your backups" step lists your backups for the shift you pick, so you can call straight from it. |
| **Policies** | The cleanup policies. **The current text is a placeholder sample** and should be replaced with the kitchen's own. |

The chosen name is kept in this browser only (`localStorage`, key
`kitchen.me`). **Not Amara? Change name** clears it. If a saved name drops
off the roster, the app asks again.

## Editing the roster: `roster.csv`

One row per student. Open it in any spreadsheet app or text editor.

```
name,phone,Mon,Tue,Wed,Thu,Fri,Sat,Sun
Amara Okafor,555-0101,x,,x,,x,,
```

- **name** is required, and each name must be different.
- **phone** is optional. With a number, the app shows a **Call** button for
  that person. Leave it blank for no button.
- **Day columns:** put `x` (or anything else) on the days they work, and
  leave the others blank. A cell with `0`, `no`, `n`, `-` or `false` also
  counts as not working. Only the day columns in the file are shown, so
  delete `Sat` and `Sun` if the kitchen doesn't run at weekends.
- Every student should have **2 to 4** shifts. The footer checks every row
  and flags anything unusual (a missing name, a name listed twice, a shift
  count outside 2 to 4). The browser console shows the same warnings.

The current rows are **sample data**: 15 made-up students with fictional
555-01xx numbers.

> **Privacy:** the repository is public, so anything in `roster.csv`,
> phone numbers included, can be read by anyone. Consider leaving `phone`
> blank, or making the repository private, before adding real numbers.

## Editing the shift time and contacts

These are in `CONFIG`, near the top of the `<script>` in `index.html`:

```js
var CONFIG = {
  shiftTime: "[SHIFT TIME]",
  kitchenManager: { name: "Sheng Xiu", phone: "[PHONE]", email: "[EMAIL]" },
  workStudyManager: { name: "Nahelia", phone: "", email: "[EMAIL]" }
};
```

A value still in `[BRACKETS]` is shown as a grey placeholder and isn't a
link. When you fill in a real phone number, **Call Sheng Xiu** becomes a
button. When you fill in real email addresses, the **Write the email**
button opens a message to both managers, with the day already filled in.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole app. |
| `roster.csv` | Who works which days. Read when the app opens. |
| `manifest.webmanifest`, `sw.js` | Make it installable and let it work offline. The page and the roster are fetched fresh whenever there's a connection. |
| `fonts/` | Inter and Playfair Display, self-hosted, with their SIL Open Font Licenses. |
| `icons/` | `icon.svg` is the source; the PNGs are rendered from it. |

## Running it

The roster is a separate file, so the app must be **served**, not opened
straight off the disk:

```
python3 -m http.server 8000    # then open http://localhost:8000
```

GitHub Pages serves it as-is. If the app is opened from the disk, the
**Call out** and **Policies** tabs still work, and **My shifts** explains
why the roster didn't load.

## The look

This uses the Ru-Yi Style System, the same as Food as Medicine: white
heads, cool cream working areas and white cards, Playfair Display headings
with one italic word in deep rust, Inter for the body text, and a
near-black footer. The tab shell is the same as the Tea Brew Chart's.
Only the pane scrolls, there's a tab bar at the foot on a phone, and from
820px a menu bar runs across the top.

Each day of the week has its own colour, used everywhere that day appears:
Mon rust, Tue teal, Wed violet, Thu green, Fri pink, Sat orange, Sun sage.
People get a colour from their name, which is used for their initials.
The Call out paths follow the poster: Planned in teal, Sick in orange, and
Covered in green. The 30-minute question is a gold diamond.

Every text colour meets WCAG AA. Each accent has a darker "ink" shade that
is used for text and filled chips.
