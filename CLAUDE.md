# Middletown Area Golf Association — Project Context

## Overview
Static GitHub Pages site at **middletowngolf.com**. Vanilla JS, JSON-driven, no server-side code. All rendering is client-side. The site is pushed to GitHub from this local folder after edits.

An **external app** manages tournament results and updates `schedule-YYYY.json` automatically after each event. Always be aware of which fields are app-owned vs. manually managed (see below).

---

## Critical: App-Owned Fields in `data/schedule-YYYY.json`

The following fields on each tournament entry are written by the app and must **never be overwritten** with null or stale values when making manual edits:

| Field | Set by app when... |
|---|---|
| `status` | Results are posted (`"upcoming"` → `"past"`) |
| `resultsPage` | Results are posted (e.g. `"results-detail.html?t=2026-june"`) |
| `winner` | Results are posted (e.g. `"Willenbrink / Hause — Net 144"`) |
| `winnerScore` | Results are posted (e.g. `144`) |

**Safe to add manually:**
- `newsletterFile` — path to newsletter HTML (e.g. `"2026/june-newsletter.html"`)
- `newsletterReady` — set to `true` when newsletter is published
- `rainedOut` — set to `true` for cancelled/rained-out tournaments

**When editing `schedule-YYYY.json`, always read the current file first and preserve any non-null app-owned values.**

---

## Newsletter Naming Convention (Critical)

The crosslink bar between results pages and newsletter pages is driven entirely by filename in `js/nav.js` — no config, no lookup. The newsletter filename **must exactly match** the tournament slug from the results `?t=` parameter.

| Results URL | Newsletter filename |
|---|---|
| `results-detail.html?t=2026-april` | `2026/april-newsletter.html` |
| `results-detail.html?t=2026-june` | `2026/june-newsletter.html` |
| `results-detail.html?t=2026-may-yankee` | `2026/may-yankee-newsletter.html` |

**Rule:** Strip the year from the `?t=` slug, append `-newsletter.html`, place in the year folder.

The results slug comes from the app — confirm it by checking the filename in `data/results/` (e.g. `2026-june.json` → slug is `june`).

---

## Newsletter Creation Checklist

When a Word doc newsletter is attached:

1. **Extract content** from the `.DOC` file using Python binary string extraction (legacy `.doc` files are not `.docx` — python-docx will fail):
   ```python
   import re
   with open('file.DOC', 'rb') as f: data = f.read()
   strings = re.findall(b'[ -~]{4,}', data)
   for s in strings: print(s.decode('ascii', errors='ignore'))
   ```

2. **Confirm the tournament slug** — check `data/results/` for the matching JSON file (e.g. `2026-june.json`). The slug is everything after `YYYY-`.

3. **Name the newsletter file** — `YYYY/[slug]-newsletter.html` (e.g. `2026/june-newsletter.html`).

4. **Build the HTML** — use the most recent newsletter as a template. Key structure:
   - `nl-nav-bar` breadcrumb at top
   - `nl-masthead` (pub name + tagline) + `nl-masthead-meta` (Volume, Month, Course)
   - `nl-body` containing `nl-article nl-full` sections
   - `nl-nav` prev/next bar at bottom
   - Volume = year − 2000 (2026 = Vol 26); Issue = tournament number in the season
   - CSS path: `../css/style.css` | nav.js path: `../js/nav.js`

5. **Section order** (standard layout):
   1. From the Commissioner
   2. Any special notices (e.g. New Website, rain-out credits)
   3. Tournament Results (team finishes → low net → closest to pin → skins)
   4. Up Next

6. **Content rules:**
   - Do not change any wording unless there is a clear misspelling or missing punctuation
   - Team winnings in the doc = per team total → display as per-golfer (divide by 2)
   - Low Net winnings = per golfer as listed in the doc
   - Closest to Pin winnings = per golfer as listed

7. **Update `data/newsletters-YYYY.json`** — add the new issue entry at the end of the `issues` array:
   ```json
   { "month": "June", "label": "June 2026", "page": "2026/june-newsletter.html" }
   ```

8. **Update `data/schedule-YYYY.json`** — add to the matching tournament entry:
   ```json
   "newsletterFile": "2026/june-newsletter.html",
   "newsletterReady": true
   ```
   **Read the file first. Do not overwrite `status`, `resultsPage`, `winner`, or `winnerScore`.**

---

## Key Data Files

| File | Purpose |
|---|---|
| `data/schedule-YYYY.json` | Tournament schedule; drives homepage and signup pages |
| `data/newsletters-YYYY.json` | Newsletter index; drives the newsletters listing page |
| `data/results/YYYY-slug.json` | Per-tournament results; loaded by `results-detail.html` |
| `data/leaderboard-YYYY.json` | Season money list (tournament + side winnings) |
| `data/points-YYYY.json` | Season net points standings |
| `data/results-index.json` | Archive grid on `results.html`; add new years here |
| `data/results-YYYY.json` | List of result page links for a given year |

---

## Homepage Sorting Logic (`index.html`)

Tournaments are sorted into three buckets by date — `status` field does **not** control this:

| Condition | Display section |
|---|---|
| `rainedOut: true` | Always → "Completed This Season" (with amber Rained Out badge) |
| Date ≥ today | "Upcoming" |
| Date < today AND ≤ 7 days ago | "Just Played" |
| Date < today AND > 7 days ago | "Completed This Season" |

---

## Results Page (`results-detail.html`)

All rendering logic lives in this one file — no per-tournament HTML pages. Data comes from `data/results/YYYY-slug.json`.

**Awards & Prizes section order:**
1. Closest to Pin (always first when present)
2. Side Games — sub-sections for Low Net, Skins, Longest Drive (each hidden if no data)
3. Special Awards (if present)

**Tie detection for teams:** Automatic — if two teams share the same `combinedNetScore`, both display "T3" (or whatever the tied rank is).

**Hole number normalization:** `fmtHole()` in `renderAwardBlock()` handles any format — `"#2"` → `"Hole 2"`, `"2"` → `"Hole 2"`, `"Hole 2"` → `"Hole 2"`.

---

## CSS Badge Classes

| Class | Appearance | Use |
|---|---|---|
| `badge-gold` | Gold | "Most Recent" on newsletters page |
| `badge-past` | Grey | Completed tournament |
| `badge-rainout` | Amber | Rained-out / cancelled tournament |

---

## Year Rollover

To add a new season year:
1. Create `data/schedule-YYYY.json` (copy prior year structure, update dates/courses)
2. Create `data/newsletters-YYYY.json` (empty `issues` array)
3. Add prior year to `data/results-index.json`
4. Update `newsletters.html` JS to load the new year as current and prior year as previous
5. Create `YYYY/` folder for newsletter HTML files
