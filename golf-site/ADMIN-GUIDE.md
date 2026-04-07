# Site Admin Guide — Middletown Area Golf Association

This guide explains how to update every part of the site by editing data files.
**You never need to edit HTML or CSS** — just update the right JSON file and publish.

---

## How the Site Works

All dynamic content lives in the `/data/` folder as JSON files:

| File | Controls |
|------|----------|
| `data/schedule.json` | Tournament schedule (all years) |
| `data/teetimes.json` | Current tee times & pairings |
| `data/newsletters.json` | Newsletter archive links |
| `data/results-index.json` | Results archive index |

Edit a JSON file → commit → publish to GitHub Pages → site updates automatically.

---

## Common Tasks

### 📅 Update the Tournament Schedule (new year)

Open `data/schedule.json`. Copy the `"2026"` season block and:
1. Change the year key from `"2026"` to `"2027"`
2. Update all dates, courses, formats, fees, and posting dates
3. Save and publish

### ⏰ Post New Tee Times

Open `data/teetimes.json`. Edit the `"current"` object:

```json
{
  "current": {
    "event": "May 2026 — Shaker Run",
    "date": "2026-05-16",
    "displayDate": "May 16, 2026",
    "course": "Shaker Run",
    "format": "3 Man Single/Double/Triple Ball",
    "startTime": "9:00 AM",
    "groups": [
      { "time": "9:00 AM",  "players": ["Player 1", "Player 2", "Player 3", "Player 4"] },
      { "time": "9:08 AM",  "players": ["Player 5", "Player 6", "Player 7", "Player 8"] }
    ]
  }
}
```

Also copy the current entry into `"archive"` before replacing it.

### 📰 Add a New Newsletter

Open `data/newsletters.json`. Find the current year block and add a new issue:

```json
{ "month": "May", "issue": 2, "file": "2026/2-MayNewsletter.htm" }
```

The file path should match where the actual newsletter HTML file lives on your server.

### 🏆 Add Tournament Results

Open `data/results-index.json`. Find the current year in `"years"` and verify the months array includes the new month. Results pages link back to `https://www.tjcope.net/maga/` by default — update `sourceBase` if your new site hosts the result files.

### 🏌️ Mark a Tournament as Completed

Open `data/schedule.json`, find the tournament, and change `"status"` from `"upcoming"` to `"past"`:

```json
"status": "past"
```

---

## Google Forms Setup (Sign Up & Membership)

The Sign Up and Membership pages are ready to embed Google Forms.

1. Go to [forms.google.com](https://forms.google.com) and create your form
2. Click **Send** → **< >** (Embed) tab
3. Copy just the `src="..."` URL from the iframe code
4. Open `signup.html` or `application.html`
5. Find the commented-out `<iframe>` block and uncomment it
6. Replace `YOUR_GOOGLE_FORM_ID` with the actual ID from your form URL
7. Save and publish

**Recommended fields for Sign Up form:**
- Player Name (required)
- Partner Name (if signing as twosome)
- Tournament (dropdown)
- Email (required)
- Low Net add-on ($5) — checkbox
- Skins add-on ($5) — checkbox
- Notes

**Recommended fields for Membership form:**
- Full Name, Address, City, Zip
- Date of Birth
- Home Phone, Cell Phone, Email
- GHIN Number (7 digits)
- Home Course
- Recruited By
- Membership type (Full Member $25 / Guest — No Fee)

---

## GitHub Pages Deployment

This is a fully static site — no build step required. Just push files to your repo.

**Recommended repo structure:**
```
your-repo/
├── index.html
├── teetimes.html
├── signup.html
├── results.html
├── newsletters.html
├── application.html
├── css/style.css
├── js/main.js
├── data/
│   ├── schedule.json
│   ├── teetimes.json
│   ├── newsletters.json
│   └── results-index.json
└── ADMIN-GUIDE.md
```

Enable GitHub Pages in repo Settings → Pages → Source: main branch / root.

---

## Site Name

The site currently displays **"Middletown Area Golf"** everywhere.
When you decide on a final name, do a find-and-replace across all `.html` files for:
- `Middletown Area Golf Association` → new full name
- `Middletown Area Golf` → new short name

---

## Contact

For website issues: russyenser@gmail.com
