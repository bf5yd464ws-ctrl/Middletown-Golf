/**
 * Middletown Area Golf Association — Main JS
 * All site behavior is driven by data files in /data/
 * To update content: edit the JSON files, not this script.
 */

// ─── Mobile Nav Toggle ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('main-nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', nav.classList.contains('open'));
    });

    // Close nav when a link is clicked (mobile)
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => nav.classList.remove('open'));
    });

    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove('open');
      }
    });
  }

  // ─── Results Archive Accordion ─────────────────────────────────────────────
  document.querySelectorAll('.results-year-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      if (content) content.classList.toggle('open');
      const arrow = btn.querySelector('.toggle-arrow');
      if (arrow) arrow.textContent = content?.classList.contains('open') ? '▲' : '▼';
    });
  });

  // ─── Highlight current page in nav ─────────────────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});

// ─── Utility: Format date ──────────────────────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ─── Utility: Days until date ──────────────────────────────────────────────
function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T12:00:00');
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff;
}
