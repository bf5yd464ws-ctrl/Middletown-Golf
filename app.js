/* ============================================================
   Middletown Area Golf Association — app.js
   Single-page app: reads season JSON files, renders all views
   ============================================================ */

const state = {
  seasons: {},
  currentView: 'home',
};

const CURRENT_YEAR = new Date().getFullYear();

// Boot
document.addEventListener('DOMContentLoaded', () => {
  router();
  window.addEventListener('hashchange', router);
});

// Load season data
async function loadSeasonData(year) {
  if (state.seasons[year]) return;
  try {
    const res = await fetch(`data/${year}/schedule.json`);
    if (!res.ok) throw new Error('Not found');
    const scheduleData = await res.json();
    state.seasons[year] = { schedule: scheduleData.schedule || [] };
  } catch (e) {
    console.error(`Error loading season ${year}:`, e);
    state.seasons[year] = null;
  }
}

// Router
function router() {
  const hash = window.location.hash.slice(1) || '';
  const view = hash.split('/')[0];

  if (!view || view === 'home') render('home');
  else if (view === 'results') render('resultsIndex');
  else if (view === 'newsletters') render('newslettersIndex');
  else if (view === 'teetimes') render('teetimes');
  else if (view === 'signup') render('signup');
  else if (view === 'membership') render('membership');
  else render('home');
}

// Render dispatcher
function render(view) {
  const main = document.getElementById('main-content');
  state.currentView = view;

  switch (view) {
    case 'home': main.innerHTML = renderHome(); break;
    case 'resultsIndex': main.innerHTML = renderResultsIndex(); break;
    case 'newslettersIndex': main.innerHTML = renderNewslettersIndex(); break;
    case 'teetimes': main.innerHTML = renderTeeTimes(); break;
    case 'signup': main.innerHTML = renderSignup(); break;
    case 'membership': main.innerHTML = renderMembership(); break;
    default: main.innerHTML = renderHome();
  }

  window.scrollTo(0, 0);
}

// HOME VIEW
function renderHome() {
  loadSeasonData(CURRENT_YEAR).then(() => {
    const schedDiv = document.getElementById('schedule-content');
    if (!schedDiv) return;
    const s = state.seasons[CURRENT_YEAR];
    if (!s || !s.schedule || s.schedule.length === 0) {
      schedDiv.innerHTML = '<p class="text-muted">Schedule coming soon — check back closer to the season.</p>';
      return;
    }
    schedDiv.innerHTML = renderScheduleTable(s);
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
        <div class="season-badge">${CURRENT_YEAR} Season</div>
        <h2>Tournament Schedule</h2>
        <div id="schedule-content"><p class="text-muted">Loading schedule…</p></div>
      </div>

      <div class="two-col">
        <div class="section-card">
          <h2>Contact & Info</h2>
          <div class="contact-grid">
            <div class="contact-item">
              <div class="label">Association Contact</div>
              <div class="value">Russ Yenser</div>
              <div class="sub"><a href="mailto:russyenser@gmail.com">russyenser@gmail.com</a></div>
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

function renderScheduleTable(season) {
  if (!season.schedule || season.schedule.length === 0) 
    return '<p class="text-muted">No schedule available.</p>';
  
  const rows = season.schedule.map(e => `
    <tr>
      <td class="date-col">${e.date}</td>
      <td class="course-col">${e.course}</td>
      <td>${e.format}</td>
      <td>${e.entryFee}</td>
      <td><span class="text-muted">Upcoming</span></td>
    </tr>`).join('');
  
  return `
    <table class="schedule-table">
      <thead><tr><th>Date</th><th>Course</th><th>Format</th><th>Entry</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="note">* Carts not included. Entries due 10 days before each event.</p>
  `;
}

// RESULTS INDEX VIEW
function renderResultsIndex() {
  return `
    <div class="page-container">
      <h1>Tournament Results & History</h1>
      <div class="section-card">
        <p class="text-muted">Results index coming soon.</p>
      </div>
    </div>
  `;
}

// NEWSLETTERS VIEW
function renderNewslettersIndex() {
  return `
    <div class="page-container">
      <h1>Newsletters</h1>
      <div class="section-card">
        <p class="text-muted">Newsletters coming soon during golf season.</p>
      </div>
    </div>
  `;
}

// TEE TIMES VIEW
function renderTeeTimes() {
  return `
    <div class="page-container">
      <h1>Tee Times</h1>
      <div class="section-card">
        <p class="text-muted">Tee times information coming soon.</p>
      </div>
    </div>
  `;
}

// SIGNUP VIEW
function renderSignup() {
  return `
    <div class="page-container">
      <h1>Sign Up</h1>
      <div class="section-card">
        <p class="text-muted">Sign up information and forms coming soon. Check the tournament schedule for individual tournament signups.</p>
      </div>
    </div>
  `;
}

// MEMBERSHIP VIEW
function renderMembership() {
  return `
    <div class="page-container">
      <h1>Membership</h1>
      <div class="section-card">
        <p class="text-muted">Membership information coming soon.</p>
      </div>
    </div>
  `;
}
