/* ============================================================
   Middletown Area Golf Association — app.js
   Single-page app: reads season JSON files, renders all views
   ============================================================ */

// ── State ────────────────────────────────────────────────────
const state = {
  seasons: {},        // cache: { 2025: {…}, 2026: {…} }
  currentView: 'home',
  currentYear: null,
  currentTournamentId: null,
};

// ── Known seasons (past seasons link to original site) ───────
const BUILT_SEASONS = [2025, 2026]; // add new years as JSON files are added
const LEGACY_BASE = 'https://www.tjcope.net/maga';

// ── Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  router();
  window.addEventListener('hashchange', router);
});

function router() {
  const hash = window.location.hash.slice(1) || '';
  const [view, ...params] = hash.split('/');

  if (!view || view === 'home') return render('home');
  if (view === 'results') return render('resultsIndex');
  if (view === 'newsletters') return render('newslettersIndex');
  if (view === 'teetimes') return render('teetimes');
  if (view === 'signup') return render('signup');
  if (view === 'membership') return render('membership');

  if (view === 'season' && params[0]) {
    const year = parseInt(params[0]);
    const tid = params[1] || null;
    loadSeason(year).then(() => {
      if (tid === 'standings') return render('standings', year);
      if (tid === 'newsletters') return render('seasonNewsletters', year);
      if (tid) return render('tournament', year, tid);
      return render('seasonHome', year);
    });
    return;
  }

  render('home');
}

// ── Data loading ─────────────────────────────────────────────
async function loadSeason(year) {
  if (state.seasons[year]) return;
  try {
    const res = await fetch(`data/${year}.json`);
    if (!res.ok) throw new Error('Not found');
    state.seasons[year] = await res.json();
  } catch (e) {
    state.seasons[year] = null;
  }
}

// ── Render dispatcher ─────────────────────────────────────────
function render(view, year, tid) {
  state.currentView = view;
  state.currentYear = year || null;
  state.currentTournamentId = tid || null;

  const main = document.getElementById('main-content');
  const nav = document.getElementById('main-nav');

  updateNav(view, year, tid);

  switch (view) {
    case 'home':           main.innerHTML = renderHome(); break;
    case 'resultsIndex':   main.innerHTML = renderResultsIndex(); break;
    case 'newslettersIndex': main.innerHTML = renderNewslettersIndex(); break;
    case 'teetimes':       main.innerHTML = renderTeeTimes(); break;
    case 'signup':         main.innerHTML = renderSignup(); break;
    case 'membership':     main.innerHTML = renderMembership(); break;
    case 'seasonHome':     main.innerHTML = renderSeasonHome(year); break;
    case 'standings':      main.innerHTML = renderStandings(year); break;
    case 'tournament':     main.innerHTML = renderTournament(year, tid); break;
    case 'seasonNewsletters': main.innerHTML = renderSeasonNewsletters(year); break;
    default:               main.innerHTML = renderHome();
  }

  window.scrollTo(0, 0);
}

// ── Nav ───────────────────────────────────────────────────────
function updateNav(view, year, tid) {
  document.querySelectorAll('.main-nav a').forEach(a => a.classList.remove('active'));
  const map = {
    home: '#nav-home', resultsIndex: '#nav-results', newslettersIndex: '#nav-newsletters',
    teetimes: '#nav-teetimes', signup: '#nav-signup', membership: '#nav-membership',
    seasonHome: '#nav-results', standings: '#nav-results', tournament: '#nav-results',
    seasonNewsletters: '#nav-newsletters',
  };
  const sel = map[view];
  if (sel) {
    const el = document.querySelector(sel);
    if (el) el.classList.add('active');
  }

  // Show/hide month nav
  const monthNav = document.getElementById('month-nav');
  if (monthNav) {
    if ((view === 'tournament' || view === 'standings') && year && state.seasons[year]) {
      monthNav.style.display = '';
      renderMonthNav(year, view, tid);
    } else {
      monthNav.style.display = 'none';
    }
  }
}

function renderMonthNav(year, view, tid) {
  const season = state.seasons[year];
  if (!season) return;
  const nav = document.getElementById('month-nav');

  const months = season.tournaments.map(t => {
    const label = t.subLabel ? `${t.month} (${t.subLabel})` : t.month;
    const active = view === 'tournament' && tid === t.id ? ' class="active"' : '';
    return `<a href="#season/${year}/${t.id}"${active}>${label}</a>`;
  });

  const standingsActive = view === 'standings' ? ' class="active"' : '';
  months.push(`<a href="#season/${year}/standings"${standingsActive}>Standings</a>`);

  const nlActive = view === 'seasonNewsletters' ? ' class="active"' : '';
  months.push(`<a href="#season/${year}/newsletters"${nlActive}>Newsletters</a>`);

  nav.innerHTML = months.join('');
}

// ── View: Home ────────────────────────────────────────────────
function renderHome() {
  // Find the most current season with a JSON file
  const latestYear = Math.max(...BUILT_SEASONS.filter(y => state.seasons[y] !== null));
  // Try to load latest season for schedule preview - may not be loaded yet
  // We'll show the current year's schedule if available
  const currentYear = new Date().getFullYear();

  // Load current year in background for schedule
  loadSeason(currentYear).then(() => {
    const schedDiv = document.getElementById('schedule-content');
    if (!schedDiv) return;
    const s = state.seasons[currentYear];
    if (!s) {
      schedDiv.innerHTML = '<p class="text-muted">Schedule coming soon — check back closer to the season.</p>';
      return;
    }
    schedDiv.innerHTML = renderScheduleTable(s, currentYear);
  });

  // Load previous year for standings summary
  const prevYear = currentYear - 1;
  loadSeason(prevYear).then(() => {
    const el = document.getElementById('prev-standings');
    if (!el) return;
    const s = state.seasons[prevYear];
    if (!s) return;
    const np = s.standings.netPoints[0];
    const ml = s.standings.money[0];
    el.innerHTML = `
      <div class="stat-pill">🏆 Net Points: <strong>${np.player}</strong> — ${np.total} pts</div>
      <div class="stat-pill">💰 Money: <strong>${ml.player}</strong> — $${ml.total}</div>
      <div style="margin-top:.75rem;"><a href="#season/${prevYear}/standings" class="link-btn">Full ${prevYear} Standings →</a></div>
    `;
  });

  return `
    <section class="hero">
      <h1>Middletown Area Golf Association</h1>
      <div class="gold-line"></div>
      <p class="est">Established 2001 · Middletown, Ohio</p>
      <p class="intro">Recreational golf tournaments serving the greater Middletown area for over two decades.</p>
    </section>

    <div class="page-container">
      <div class="section-card">
        <div class="season-badge">${currentYear} Season</div>
        <h2>Tournament Schedule</h2>
        <div id="schedule-content"><p class="text-muted">Loading schedule…</p></div>
      </div>

      <div class="two-col">
        <div class="section-card">
          <h2>${prevYear} Final Standings</h2>
          <div id="prev-standings"><p class="text-muted">Loading…</p></div>
        </div>
        <div class="section-card">
          <h2>Contact &amp; Info</h2>
          <div class="contact-grid">
            <div class="contact-item">
              <div class="label">Association Contact</div>
              <div class="value">Russ Yenser</div>
              <div class="sub"><a href="tel:5135717931">513-571-7931</a></div>
            </div>
            <div class="contact-item">
              <div class="label">Site Administrator</div>
              <div class="value">TJ Cope</div>
              <div class="sub"><a href="mailto:maga.admin@tjcope.net">maga.admin@tjcope.net</a></div>
            </div>
            <div class="contact-item">
              <div class="label">Mailing Address</div>
              <div class="value small">503 Cranewood Drive<br>Trenton, Ohio 45067</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderScheduleTable(season, year) {
  const rows = season.schedule.map(e => {
    const resultId = e.resultsId;
    const tournament = season.tournaments.find(t => t.id === resultId);
    const resultLink = tournament
      ? `<a href="#season/${year}/${resultId}">View Results</a>`
      : `<span class="text-muted">Pending</span>`;
    return `
      <tr>
        <td class="date-col">${e.date}</td>
        <td class="course-col">${e.course}</td>
        <td>${e.format}</td>
        <td>${e.entryFee}</td>
        <td>${resultLink}</td>
      </tr>`;
  }).join('');
  return `
    <table class="schedule-table">
      <thead><tr><th>Date</th><th>Course</th><th>Format</th><th>Entry</th><th>Results</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="note">* Carts not included. Entries due 10 days before each event (14 days for Heatherwoode).</p>
  `;
}

// ── View: Results Index ───────────────────────────────────────
function renderResultsIndex() {
  const currentYear = new Date().getFullYear();
  const decades = {};

  // Group years
  for (let y = currentYear; y >= 2001; y--) {
    const decade = Math.floor(y / 10) * 10 + 's';
    if (!decades[decade]) decades[decade] = [];
    decades[decade].push(y);
  }

  const decadeKeys = Object.keys(decades).sort((a, b) => b.localeCompare(a));

  const filterBtns = ['All', ...decadeKeys].map((d, i) =>
    `<button class="decade-btn${i === 0 ? ' active' : ''}" onclick="filterDecade('${d}', this)">${d === 'All' ? 'All Years' : d}</button>`
  ).join('');

  const yearBlocks = [];
  for (let y = currentYear; y >= 2001; y--) {
    const decade = Math.floor(y / 10) * 10 + 's';
    const isBuilt = BUILT_SEASONS.includes(y);
    let links = '';

    if (isBuilt && state.seasons[y]) {
      const s = state.seasons[y];
      const tLinks = s.tournaments.map(t =>
        `<li><a href="#season/${y}/${t.id}">${t.month}${t.subLabel ? ' ('+t.subLabel+')' : ''} – ${t.course}</a></li>`
      ).join('');
      links = `<ul>
        ${tLinks}
        <li><a href="#season/${y}/standings">Season Standings</a></li>
        <li><a href="#season/${y}/newsletters">Newsletters</a></li>
      </ul>`;
    } else if (isBuilt && !state.seasons[y]) {
      links = `<p class="text-muted">Loading…</p>`;
      loadSeason(y).then(() => {
        const el = document.querySelector(`.year-block[data-year="${y}"] .year-body`);
        if (el) { el.innerHTML = renderResultsIndexLinks(y); }
      });
    } else {
      // Legacy — link to original site
      links = `<ul>
        <li><a href="${LEGACY_BASE}/${y}/1-AprilResults.htm" target="_blank">Results &amp; Standings ↗</a></li>
        <li><a href="${LEGACY_BASE}/${y}/TopTens.htm" target="_blank">Top Tens ↗</a></li>
        <li><a href="${LEGACY_BASE}/${y}/MoneyList.htm" target="_blank">Money List ↗</a></li>
      </ul>`;
    }

    const open = y === currentYear || y === currentYear - 1 ? ' open' : '';
    yearBlocks.push(`
      <div class="year-block${open ? '' : ''}" data-decade="${decade}" data-year="${y}">
        <div class="year-header${open ? ' open' : ''}" onclick="toggleYear(this)">
          <span class="year-label">${y} Season</span>
          <span class="toggle-icon">▼</span>
        </div>
        <div class="year-body${open ? ' open' : ''}">${links}</div>
      </div>`);
  }

  return `
    <div class="page-title-bar"><h1>Results Index</h1><div class="subtitle">2001 – ${currentYear} · All Seasons</div></div>
    <div class="page-container">
      <div class="section-card">
        <div class="decade-filter">${filterBtns}</div>
        ${yearBlocks.join('')}
      </div>
    </div>`;
}

function renderResultsIndexLinks(year) {
  const s = state.seasons[year];
  if (!s) return '<p class="text-muted">No data available.</p>';
  const tLinks = s.tournaments.map(t =>
    `<li><a href="#season/${year}/${t.id}">${t.month}${t.subLabel ? ' ('+t.subLabel+')' : ''} – ${t.course}</a></li>`
  ).join('');
  return `<ul>${tLinks}<li><a href="#season/${year}/standings">Season Standings</a></li><li><a href="#season/${year}/newsletters">Newsletters</a></li></ul>`;
}

// ── View: Season Home ─────────────────────────────────────────
function renderSeasonHome(year) {
  const s = state.seasons[year];
  if (!s) return '<div class="page-container"><p>Season data not found.</p></div>';

  const rows = s.schedule.map(e => {
    const t = s.tournaments.find(t => t.id === e.resultsId);
    const link = t ? `<a href="#season/${year}/${t.id}">Results</a>` : '<span class="text-muted">Pending</span>';
    return `<tr><td class="date-col">${e.date}</td><td class="course-col">${e.course}</td><td>${e.format}</td><td>${e.entryFee}</td><td>${link}</td></tr>`;
  }).join('');

  return `
    <div class="page-title-bar"><h1>${year} Season</h1></div>
    <div class="page-container">
      <div class="section-card">
        <h2>Schedule &amp; Results</h2>
        <table class="schedule-table">
          <thead><tr><th>Date</th><th>Course</th><th>Format</th><th>Entry</th><th>Results</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="two-col">
        <div class="section-card">
          <h2>Standings</h2>
          <ul style="list-style:none;line-height:2.2;">
            <li>🏆 <a href="#season/${year}/standings">Top Ten Finishes</a></li>
            <li>📊 Net Points</li>
            <li>💰 Money List</li>
            <li>💵 Side Money</li>
          </ul>
          <a href="#season/${year}/standings" class="link-btn" style="margin-top:.5rem;display:inline-block;">View All Standings →</a>
        </div>
        <div class="section-card">
          <h2>Newsletters</h2>
          <ul style="list-style:none;line-height:2.2;">
            ${s.newsletters.map(n => `<li>📰 <a href="#season/${year}/newsletters">${n.label}</a></li>`).join('')}
          </ul>
        </div>
      </div>
    </div>`;
}

// ── View: Tournament Result ───────────────────────────────────
function renderTournament(year, tid) {
  const s = state.seasons[year];
  if (!s) return '<div class="page-container"><p>Data not found.</p></div>';
  const t = s.tournaments.find(t => t.id === tid);
  if (!t) return '<div class="page-container"><p>Tournament not found.</p></div>';

  const teamRows = t.teams.map((team, i) => {
    const cls = i === 0 ? ' class="highlight"' : '';
    const payout = team.payout > 0 ? `$${team.payout}` : '—';
    return `<tr${cls}><td class="rank">${team.place}</td><td>${team.players.join(' / ')}</td><td class="score">${team.score}</td><td>${payout}</td></tr>`;
  }).join('');

  const lowNetRows = t.lowNet.map((r, i) => {
    const cls = i === 0 ? ' class="highlight"' : '';
    return `<tr${cls}><td class="rank">${r.place}</td><td>${r.player}</td><td class="score">${r.score}</td><td>$${r.payout}</td></tr>`;
  }).join('');

  const ctpRows = t.ctp.winners.map(w =>
    `<tr><td>${w.hole}</td><td>${w.player}</td><td>$${t.ctp.amount}</td></tr>`
  ).join('');

  const ctp2Rows = t.ctp2 ? t.ctp2.winners.map(w =>
    `<tr><td>${w.hole}</td><td>${w.player}</td><td>$${t.ctp2.amount}</td></tr>`
  ).join('') : '';

  const skinRows = t.skins.winners.map(w =>
    `<tr><td>${w.hole}</td><td>${w.player}</td><td>$${t.skins.amount}</td></tr>`
  ).join('');

  const playerRows = t.players.map(p => {
    const gross = p.gross !== null ? p.gross : 'X';
    const net = p.net !== null ? p.net : 'X';
    const payout = p.payout > 0 ? `$${p.payout}` : '—';
    const side = p.sideMoney > 0 ? `$${p.sideMoney}` : '—';
    return `<tr><td>${p.name}</td><td>${gross}</td><td>${side}</td><td class="score">${net}</td><td>${p.netPoints}</td><td>${payout}</td></tr>`;
  }).join('');

  const subLabel = t.subLabel ? ` — ${t.subLabel}` : '';

  // Prev/Next navigation
  const allIds = s.tournaments.map(t => t.id);
  const idx = allIds.indexOf(tid);
  const prevLink = idx > 0
    ? `<a href="#season/${year}/${allIds[idx-1]}">← ${s.tournaments[idx-1].month}</a>`
    : `<a href="#season/${year}">← ${year} Season</a>`;
  const nextLink = idx < allIds.length - 1
    ? `<a href="#season/${year}/${allIds[idx+1]}">${s.tournaments[idx+1].month} →</a>`
    : `<a href="#season/${year}/standings">Season Standings →</a>`;

  return `
    <div class="page-container">
      <div class="section-card">
        <div class="tournament-header">
          <h2>${t.month} ${year}${subLabel} — ${t.course}</h2>
          <div class="meta">${t.date} &nbsp;·&nbsp; ${t.format} &nbsp;·&nbsp; ${t.location}</div>
        </div>
        <h3>Team Results</h3>
        <table class="results-table">
          <thead><tr><th class="rank">Place</th><th>Team</th><th class="score">Score</th><th>Payout</th></tr></thead>
          <tbody>${teamRows}</tbody>
        </table>
      </div>

      <div class="section-card">
        <h2>Individual Low Net</h2>
        <table class="results-table">
          <thead><tr><th class="rank">Place</th><th>Player</th><th class="score">Net</th><th>Payout</th></tr></thead>
          <tbody>${lowNetRows}</tbody>
        </table>
      </div>

      <div class="two-col">
        <div class="section-card">
          <h2>Closest to the Pin — $${t.ctp.amount} each</h2>
          <table class="results-table">
            <thead><tr><th>Hole</th><th>Player</th><th>Prize</th></tr></thead>
            <tbody>${ctpRows}</tbody>
          </table>
          ${t.ctp2 ? `<h3 style="margin-top:1rem;">2nd Closest — $${t.ctp2.amount} each</h3>
          <table class="results-table"><thead><tr><th>Hole</th><th>Player</th><th>Prize</th></tr></thead>
          <tbody>${ctp2Rows}</tbody></table>` : ''}
        </div>
        <div class="section-card">
          <h2>Skins — $${t.skins.amount} each</h2>
          <table class="results-table">
            <thead><tr><th>Hole</th><th>Player</th><th>Prize</th></tr></thead>
            <tbody>${skinRows}</tbody>
          </table>
        </div>
      </div>

      <div class="section-card">
        <h2>Player Breakdown</h2>
        <table class="results-table">
          <thead><tr><th>Player</th><th>Gross</th><th>Side $</th><th class="score">Net</th><th>Net Pts</th><th>Payout</th></tr></thead>
          <tbody>${playerRows}</tbody>
        </table>
      </div>

      <div class="info-box">${prevLink} &nbsp;|&nbsp; ${nextLink}</div>
    </div>`;
}

// ── View: Standings ───────────────────────────────────────────
function renderStandings(year) {
  const s = state.seasons[year];
  if (!s) return '<div class="page-container"><p>Data not found.</p></div>';
  const st = s.standings;

  const npRows = st.netPoints.map((r, i) => {
    const cls = i === 0 ? ' class="highlight"' : '';
    return `<tr${cls}><td class="rank-col">${r.pos}</td><td class="player-name">${r.player}</td><td class="money">${r.total}</td></tr>`;
  }).join('');

  const mlRows = st.money.map((r, i) => {
    const cls = i === 0 ? ' class="highlight"' : '';
    return `<tr${cls}><td class="rank-col">${r.pos}</td><td class="player-name">${r.player}</td><td class="money">$${r.total}</td></tr>`;
  }).join('');

  const smRows = st.sideMoney.map((r, i) => {
    const cls = i === 0 ? ' class="highlight"' : '';
    return `<tr${cls}><td class="rank-col">${r.pos}</td><td class="player-name">${r.player}</td><td class="money">$${r.total}</td></tr>`;
  }).join('');

  return `
    <div class="page-title-bar"><h1>${year} Season Standings</h1><div class="subtitle">Year End Final</div></div>
    <div class="page-container">
      <div class="section-card" style="grid-column:1/-1;">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:2rem;">
          <div>
            <h3 style="margin-bottom:.75rem;">Net Points</h3>
            <table class="standings-table">
              <thead><tr><th>Pos</th><th>Player</th><th class="money">Total</th></tr></thead>
              <tbody>${npRows}</tbody>
            </table>
          </div>
          <div>
            <h3 style="margin-bottom:.75rem;">Money List</h3>
            <table class="standings-table">
              <thead><tr><th>Pos</th><th>Player</th><th class="money">Total</th></tr></thead>
              <tbody>${mlRows}</tbody>
            </table>
          </div>
          <div>
            <h3 style="margin-bottom:.75rem;">Side Money</h3>
            <table class="standings-table">
              <thead><tr><th>Pos</th><th>Player</th><th class="money">Total</th></tr></thead>
              <tbody>${smRows}</tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="info-box"><a href="#season/${year}">← ${year} Season</a> &nbsp;|&nbsp; <a href="#results">All Seasons →</a></div>
    </div>`;
}

// ── View: Season Newsletters ──────────────────────────────────
function renderSeasonNewsletters(year) {
  const s = state.seasons[year];
  if (!s || !s.newsletters || !s.newsletters.length) {
    return '<div class="page-container"><p>No newsletters available for this season.</p></div>';
  }

  const articles = s.newsletters.map(n => `
    <div class="newsletter-article">
      <h3>${n.label}</h3>
      <p>${n.content}</p>
    </div>`).join('');

  return `
    <div class="newsletter-container">
      <div class="newsletter-masthead">
        <div class="pub-name">The 19th Hole</div>
        <div class="pub-sub">Official Newsletter of the Middletown Area Golf Association</div>
        <div style="color:var(--gold-light);font-size:.88rem;margin-top:.75rem;letter-spacing:.06em;">${year} Season</div>
      </div>
      <div class="newsletter-body">${articles}</div>
      <div style="text-align:center;margin-top:1.5rem;">
        <a href="#season/${year}" style="color:var(--green-mid);">← ${year} Season</a>
        &nbsp;|&nbsp;
        <a href="#newsletters" style="color:var(--green-mid);">All Newsletters →</a>
      </div>
    </div>`;
}

// ── View: Newsletters Index ───────────────────────────────────
function renderNewslettersIndex() {
  const currentYear = new Date().getFullYear();
  const builtLinks = BUILT_SEASONS.sort((a, b) => b - a).map(y => {
    const s = state.seasons[y];
    if (s && s.newsletters) {
      const nlLinks = s.newsletters.map(n =>
        `<li>📰 <a href="#season/${y}/newsletters">${n.label}</a></li>`
      ).join('');
      return `<div class="section-card"><h3>${y}</h3><ul style="list-style:none;line-height:2.2;">${nlLinks}</ul></div>`;
    }
    return `<div class="section-card"><h3>${y}</h3><p class="text-muted">Loading…</p></div>`;
  }).join('');

  return `
    <div class="page-title-bar"><h1>The 19th Hole</h1><div class="subtitle">Newsletter Archive · 2001–${currentYear}</div></div>
    <div class="page-container">
      ${builtLinks}
      <div class="section-card">
        <h3>Previous Seasons (Original Site)</h3>
        <p style="font-size:.9rem;color:var(--text-mid);margin-bottom:1rem;">Newsletters from 2001–2024 are archived on the original site.</p>
        <ul style="list-style:none;line-height:2.4;">
          ${[2024,2023,2022,2021,2020,2019].map(y =>
            `<li>📰 <a href="${LEGACY_BASE}/${y}/1-AprilNewsletter.htm" target="_blank">${y} Newsletters ↗</a></li>`
          ).join('')}
        </ul>
      </div>
    </div>`;
}

// ── View: Tee Times ───────────────────────────────────────────
function renderTeeTimes() {
  const currentYear = new Date().getFullYear();
  const s = state.seasons[currentYear];

  let table = '<p class="text-muted">No tee times posted yet. Check back closer to each event.</p>';
  if (s) {
    const rows = s.schedule.map(e => `
      <tr>
        <td class="date-col">${e.date}</td>
        <td class="course-col">${e.course}</td>
        <td>${e.format}</td>
        <td class="text-muted" style="font-size:.85rem;">Posted by Wed before event</td>
      </tr>`).join('');
    table = `<table class="schedule-table">
      <thead><tr><th>Date</th><th>Course</th><th>Format</th><th>Tee Sheet</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  return `
    <div class="page-title-bar"><h1>Tee Times</h1><div class="subtitle">${currentYear} Season Starting Times</div></div>
    <div class="page-container">
      <div class="section-card">
        <h2>${currentYear} Tee Time Schedule</h2>
        <p style="color:var(--text-mid);font-size:.95rem;margin-bottom:1.5rem;">
          Tee sheets are posted by the Wednesday before each event. Arrive at least 30 minutes before your tee time.
          Contact Russ Yenser at 513-571-7931 with questions.
        </p>
        ${table}
      </div>
      <div class="info-box">Pairings and tee times for upcoming events will appear here approximately one week before each tournament.</div>
    </div>`;
}

// ── View: Sign Up ─────────────────────────────────────────────
function renderSignup() {
  return `
    <div class="page-title-bar"><h1>Event Sign Up</h1><div class="subtitle">Register for Upcoming Tournaments</div></div>
    <div class="page-container">
      <div class="section-card">
        <h2>How to Sign Up</h2>
        <p style="font-size:.95rem;color:var(--text-mid);">
          Sign-up sheets are distributed approximately 3–4 weeks before each event. Entries must be received
          <strong>10 days prior</strong> to the tournament date (14 days for Heatherwoode).
        </p>
        <ol style="font-size:.95rem;color:var(--text-mid);margin:1rem 0 0 1.5rem;line-height:2.2;">
          <li>Contact Russ Yenser to confirm your spot</li>
          <li>Mail your entry fee to the address below, or pay on event day</li>
          <li>Check the <a href="#teetimes">Tee Times page</a> for your assigned starting time</li>
          <li>Arrive at least 30 minutes before your tee time</li>
        </ol>
        <div class="info-box" style="margin-top:1.5rem;">
          <strong>Important:</strong> Golfers who back out after paying will forfeit $20 of their entry fee,
          except in cases of medical injury or sudden illness.
        </div>
      </div>
      <div class="section-card">
        <h2>Contact</h2>
        <div class="contact-grid">
          <div class="contact-item">
            <div class="label">Russ Yenser</div>
            <div class="value"><a href="tel:5135717931">513-571-7931</a></div>
          </div>
          <div class="contact-item">
            <div class="label">Mailing Address</div>
            <div class="value small">503 Cranewood Drive<br>Trenton, Ohio 45067</div>
          </div>
        </div>
      </div>
    </div>`;
}

// ── View: Membership ──────────────────────────────────────────
function renderMembership() {
  return `
    <div class="page-title-bar"><h1>Membership</h1><div class="subtitle">Join the Middletown Area Golf Association</div></div>
    <div class="page-container">
      <div class="section-card">
        <h2>About the Association</h2>
        <p style="font-size:.95rem;color:var(--text-mid);">
          The Middletown Area Golf Association has been running recreational golf tournaments since 2001.
          Membership is open to all golfers. We offer a friendly, competitive environment across some of the best
          public courses in the Cincinnati–Dayton area.
        </p>
        <p style="font-size:.95rem;color:var(--text-mid);">
          The annual application fee is <strong>$25</strong>. Each tournament also has a separate entry fee
          (see the <a href="#home">schedule</a> for this season's fees).
        </p>
      </div>
      <div class="section-card">
        <h2>How to Apply</h2>
        <p style="font-size:.95rem;color:var(--text-mid);margin-bottom:1rem;">
          Download and complete the membership application, then mail it with your fee to:
        </p>
        <div class="info-box">
          Russ Yenser<br>
          503 Cranewood Drive<br>
          Trenton, Ohio 45067
        </div>
        <p style="font-size:.9rem;color:var(--text-mid);margin-top:1rem;">
          You may also send your yearly application fee and first tournament entry at the same time.
          Contact Russ at <a href="tel:5135717931">513-571-7931</a> with any questions.
        </p>
      </div>
      <div class="section-card">
        <h2>What's Included</h2>
        <table class="schedule-table">
          <tbody>
            <tr><td class="course-col">Season</td><td>8 events, April through October</td></tr>
            <tr><td class="course-col">Formats</td><td>Individual, 2-man, 3-man, and 4-man team events</td></tr>
            <tr><td class="course-col">Prizes</td><td>Cash for top finishers, skins, closest to pin, and year-end bonuses</td></tr>
            <tr><td class="course-col">Newsletter</td><td>"The 19th Hole" published throughout the season</td></tr>
            <tr><td class="course-col">Records</td><td>Full results, standings, and career totals posted online</td></tr>
          </tbody>
        </table>
      </div>
    </div>`;
}

// ── Global helpers (called from inline onclick) ───────────────
window.toggleYear = function(header) {
  header.classList.toggle('open');
  header.nextElementSibling.classList.toggle('open');
};

window.filterDecade = function(decade, btn) {
  document.querySelectorAll('.decade-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.year-block').forEach(block => {
    block.style.display = (decade === 'All' || block.dataset.decade === decade) ? '' : 'none';
  });
};
