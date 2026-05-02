/* ── Google Analytics (GA4 — site-wide via nav.js) ── */
(function () {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', 'G-92CJV5B0FE');
  var _ga = document.createElement('script');
  _ga.async = true;
  _ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-92CJV5B0FE';
  document.head.appendChild(_ga);
})();

/**
 * Shared header + footer injector
 * Detects year-subfolder depth so links work from both root pages and /YYYY/ subpages,
 * whether hosted at the root (localhost) or in a subdirectory (GitHub Pages).
 */
(function () {
  const path     = window.location.pathname;
  const segments = path.split('/').filter(Boolean);

  /* We're in a /YYYY/ subfolder if the second-to-last path segment is a 4-digit year.
     Works for both:  /2025/season.html  and  /golf-site/2025/season.html  */
  const parentSeg = segments.length >= 2 ? segments[segments.length - 2] : '';
  const inSub     = /^\d{4}$/.test(parentSeg);
  const base      = inSub ? '../' : '';
  const page      = path.split('/').pop() || 'index.html';

  /* Which top-level page are we on? */
  function isActive(href) {
    if (href === base + 'index.html' && (page === 'index.html' || page === '')) return true;
    const target = href.replace(base, '');
    return page === target || path.includes(target.replace('.html', ''));
  }

  const navLinks = [
    { href: base + 'index.html',       label: 'Schedule'     },
    { href: base + 'standings.html',   label: 'Standings'    },
    { href: base + 'signup.html',      label: 'Sign Up'      },
    { href: base + 'results.html',     label: 'Past Results' },
    { href: base + 'newsletters.html', label: 'Newsletter'   },
    { href: base + 'application.html', label: 'Membership'   },
  ];

  const golferSVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="10.5" y="2" width="1.5" height="20" rx="0.75"/>
    <path d="M12 3 L20 7 L12 11 Z"/>
  </svg>`;

  const headerHTML = `
    <header class="site-header" id="site-header-el">
      <div class="header-inner">
        <a href="${base}index.html" class="site-logo">
          <div class="logo-mark">${golferSVG}</div>
          <div class="logo-text">
            <span class="name">Middletown Area Golf</span>
            <span class="tagline">Member Association &middot; Est. 2001</span>
          </div>
        </a>
        <button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false">
          <div class="hamburger-bars"><span></span><span></span><span></span></div>
          <span class="hamburger-label">Menu</span>
        </button>
        <nav class="main-nav" id="main-nav">
          ${navLinks.map(l => `<a href="${l.href}" class="nav-link${isActive(l.href) ? ' active' : ''}">${l.label}</a>`).join('')}
        </nav>
      </div>
    </header>`;

  const footerHTML = `
    <footer class="site-footer">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>Middletown Area Golf Association</h4>
          <p>Monthly tournament golf in Southwest Ohio since 2001. Eight events per season, April through October.</p>
        </div>
        <div class="footer-col">
          <h4>Navigation</h4>
          <div class="footer-links">
            ${navLinks.map(l => `<a href="${l.href}">${l.label}</a>`).join('')}
          </div>
        </div>
        <div class="footer-col">
          <h4>Contact</h4>
          <div class="footer-links">
            <a href="tel:5135717931">513-571-7931 &mdash; Russ Yenser</a>
            <a href="mailto:russyenser@gmail.com">russyenser@gmail.com</a>
            <span style="font-size:0.8rem;color:rgba(255,255,255,0.45);line-height:1.6;">503 Cranewood Drive<br>Trenton, OH 45067</span>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; ${new Date().getFullYear()} Middletown Area Golf Association</span>
        <span>Website questions: <a href="mailto:russyenser@gmail.com">russyenser@gmail.com</a></span>
      </div>
    </footer>`;

  /* Inject header + footer */
  const hSlot = document.getElementById('app-header');
  const fSlot = document.getElementById('app-footer');
  if (hSlot) hSlot.outerHTML = headerHTML;
  if (fSlot) fSlot.outerHTML = footerHTML;

  /* ── End-of-season Sign Up disable ── */
  (async function () {
    try {
      const year = new Date().getFullYear();
      const sched = await fetch(base + 'data/schedule-' + year + '.json').then(r => r.json());
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const hasOpenSignup = (sched.tournaments || []).some(t => {
        if (!t.signupFile) return false;                          // no form = not signable
        const dl = t.deadlineDate ? new Date(t.deadlineDate + 'T00:00:00') : null;
        return !dl || dl >= today;                                // no deadline, or deadline not yet passed
      });
      if (!hasOpenSignup) {
        /* Find the Sign Up nav link and disable it.
           Use a ready-state guard so it works whether fetch resolves
           before or after DOMContentLoaded fires. */
        const disableSignupLink = () => {
          const signupLink = document.querySelector('.main-nav a[href$="signup.html"]');
          if (signupLink) {
            signupLink.removeAttribute('href');
            signupLink.classList.add('nav-link--disabled');
            signupLink.setAttribute('title', 'No open signups at this time');
            signupLink.setAttribute('aria-disabled', 'true');
          }
        };
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', disableSignupLink);
        } else {
          disableSignupLink();
        }
      }
    } catch (e) { /* fail silently — nav remains fully functional */ }
  })();

  /* Mobile nav toggle + Back to Top */
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('hamburger');
    const nav = document.getElementById('main-nav');
    if (btn && nav) {
      btn.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        btn.setAttribute('aria-expanded', open);
      });
      document.addEventListener('click', e => {
        if (!btn.contains(e.target) && !nav.contains(e.target)) nav.classList.remove('open');
      });
    }

    /* Back to Top */
    const btt = document.createElement('button');
    btt.className = 'back-to-top';
    btt.setAttribute('aria-label', 'Back to top');
    btt.innerHTML = '&#8679; Back to Top';
    document.body.appendChild(btt);
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
      btt.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
  });

  /* ── Item 7: Cross-link results ↔ newsletter on sub-pages ── */
  const xMap = {
    '-results.html':    { icon: '📰', to: '-newsletter.html', label: 'Read the newsletter from this event',        cta: 'View Newsletter →' },
    '-newsletter.html': { icon: '🏌️', to: '-results.html',    label: 'View the full results from this tournament', cta: 'View Results →'    },
  };
  let xConf = null;
  for (const [suffix, conf] of Object.entries(xMap)) {
    if (page.endsWith(suffix)) { xConf = { suffix, ...conf }; break; }
  }
  if (xConf) {
    const targetPage = page.replace(xConf.suffix, xConf.to);
    const bar = document.createElement('div');
    bar.className = 'crosslink-bar';
    bar.innerHTML = `
      <span class="crosslink-icon">${xConf.icon}</span>
      <span class="crosslink-text">${xConf.label}:</span>
      <a href="${targetPage}" class="crosslink-link">${xConf.cta}</a>`;
    document.addEventListener('DOMContentLoaded', () => {
      const hero = document.querySelector('.page-hero');
      if (hero) hero.insertAdjacentElement('afterend', bar);
      else {
        const main = document.querySelector('main');
        if (main) main.insertAdjacentElement('beforebegin', bar);
      }
    });
  }
})();
