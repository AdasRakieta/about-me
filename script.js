// ===========================
// Typed text effect
// ===========================
const phrases = [
  'Full-Stack Developer',
  'Freelancer',
  'Problem Solver',
  'UI/UX Enthusiast',
];

let phraseIdx = 0;
let charIdx = 0;
let deleting = false;
const typedEl = document.getElementById('typed-text');

function typeLoop() {
  if (!typedEl) return;
  const current = phrases[phraseIdx];

  if (!deleting) {
    typedEl.textContent = current.slice(0, ++charIdx);
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1800);
      return;
    }
  } else {
    typedEl.textContent = current.slice(0, --charIdx);
    if (charIdx === 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
    }
  }
  setTimeout(typeLoop, deleting ? 55 : 95);
}

// ===========================
// Mobile nav toggle
// ===========================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.setAttribute(
    'aria-expanded',
    navLinks.classList.contains('open').toString()
  );
});

// Close nav when a link is clicked
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// ===========================
// Active nav link on scroll
// ===========================
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('#nav-links a');

function updateActiveLink() {
  const scrollY = window.scrollY + 80;
  sections.forEach((sec) => {
    const top = sec.offsetTop;
    const height = sec.offsetHeight;
    const id = sec.getAttribute('id');
    const anchor = document.querySelector(`#nav-links a[href="#${id}"]`);
    if (anchor) {
      anchor.classList.toggle('active', scrollY >= top && scrollY < top + height);
    }
  });
}

window.addEventListener('scroll', updateActiveLink);

// ===========================
// Scroll reveal
// ===========================
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach((el) => revealObserver.observe(el));

// ===========================
// Skill bar animation
// ===========================
const skillBars = document.querySelectorAll('.skill-bar-fill');

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target;
        target.style.width = target.dataset.width;
        skillObserver.unobserve(target);
      }
    });
  },
  { threshold: 0.3 }
);

skillBars.forEach((bar) => skillObserver.observe(bar));

// ===========================
// Rate limiter – 5 messages / calendar day per browser
// ===========================
const RATE_KEY   = 'cf_quota';
const RATE_LIMIT = 5;

function getRateData() {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      const today = new Date().toISOString().slice(0, 10);
      if (data.date === today) return data;
    }
  } catch { /* ignore parse errors */ }
  return { date: new Date().toISOString().slice(0, 10), count: 0 };
}

function saveRateData(data) {
  try { localStorage.setItem(RATE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

function getRemainingSubmits() {
  return Math.max(0, RATE_LIMIT - getRateData().count);
}

function markSubmitUsed() {
  const d = getRateData();
  d.count += 1;
  saveRateData(d);
}

// ===========================
// Contact form → Web3Forms + GitHub Issues
// ===========================
const contactForm = document.getElementById('contact-form');
const rateNote    = document.getElementById('form-rate-note');

function updateRateNote() {
  if (!rateNote) return;
  const left = getRemainingSubmits();
  if (left <= 0) {
    rateNote.textContent = 'Daily message limit reached (5/day). Try again tomorrow.';
    rateNote.style.color = '#b83a2a';
  } else if (left <= 2) {
    rateNote.textContent = `${left} message${left === 1 ? '' : 's'} remaining today.`;
    rateNote.style.color = 'var(--clr-text-muted)';
  } else {
    rateNote.textContent = '';
  }
}

updateRateNote();

if (contactForm) {
  // Disable button immediately if quota is already exhausted
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  if (getRemainingSubmits() <= 0 && submitBtn) {
    submitBtn.disabled = true;
  }

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // --- Rate limit guard ------------------------------------------------
    if (getRemainingSubmits() <= 0) {
      updateRateNote();
      return;
    }

    // --- Basic field validation ------------------------------------------
    const _name    = (contactForm.querySelector('[name="name"]')?.value    || '').trim();
    const _email   = (contactForm.querySelector('[name="email"]')?.value   || '').trim();
    const _message = (contactForm.querySelector('[name="message"]')?.value || '').trim();
    const emailRe  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!_name || !_email || !_message) {
      alert('Please fill in your name, email and message.');
      return;
    }
    if (!emailRe.test(_email)) {
      alert('Please enter a valid email address.');
      return;
    }

    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    // --- Geolocation (country / city) via ipapi.co -----------------------
    let geoInfo = 'unknown';
    let geoObj  = {};
    try {
      const ctrl = new AbortController();
      const tid  = setTimeout(() => ctrl.abort(), 4000);
      const geoRes = await fetch('https://ipapi.co/json/', { signal: ctrl.signal });
      clearTimeout(tid);
      if (geoRes.ok) {
        geoObj  = await geoRes.json();
        geoInfo = [geoObj.country_name, geoObj.city, geoObj.timezone].filter(Boolean).join(' / ');
      }
    } catch { /* silently ignore – geo is best-effort */ }

    // --- Populate hidden metadata fields ---------------------------------
    const senderName    = (contactForm.querySelector('[name="name"]')?.value   || '').trim();
    const senderEmail   = (contactForm.querySelector('[name="email"]')?.value  || '').trim();
    const topic         = (contactForm.querySelector('[name="topic"]')?.value  || '').trim();
    const messageText   = (contactForm.querySelector('[name="message"]')?.value|| '').trim();
    const sentAt        = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw', hour12: false });

    contactForm.querySelector('#field-subject').value  = `[about-me portfolio] ${topic || 'New message'}`;
    contactForm.querySelector('#field-country').value  = geoInfo;
    contactForm.querySelector('#field-sent-at').value  = sentAt;
    contactForm.querySelector('#field-device').value   = `${navigator.userAgent} | lang: ${navigator.language}`;
    contactForm.querySelector('#field-referrer').value = document.referrer || 'direct';

    // --- Submit via Web3Forms (use FormData, no headers per official docs) --
    try {
      const formData = new FormData(contactForm);
      const res      = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();

      // Detailed error logging for diagnostics
      if (!res.ok || !result.success) {
        console.error('❌ Web3Forms Error:');
        console.error('Status:', res.status, res.statusText);
        console.error('Response:', result);
        console.error('FormData sent:', Object.fromEntries(formData));
        throw new Error(result.message || `HTTP ${res.status}: ${res.statusText}`);
      }

      // Consume one rate-limit token
      markSubmitUsed();
      updateRateNote();

      // --- Create GitHub Issue as a permanent record --------------------
      const ghToken = document.querySelector('meta[name="gh-token"]')?.content || '';
      if (ghToken && ghToken !== '__GH_ISSUES_TOKEN__') {
        const issueBody = [
          `**From:** ${senderName} <${senderEmail}>`,
          `**Subject:** ${topic || '—'}`,
          `**Sent at:** ${sentAt} (Warsaw)`,
          `**Country / City:** ${geoInfo}`,
          `**Referrer:** ${document.referrer || 'direct'}`,
          `**Device:** \`${navigator.userAgent}\``,
          '',
          '---',
          '',
          '**Message:**',
          '',
          messageText,
        ].join('\n');

        fetch('https://api.github.com/repos/AdasRakieta/about-me/issues', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ghToken}`,
            'Content-Type':  'application/json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
          body: JSON.stringify({
            title:  `[contact-form] ${topic || senderName || 'New message'} — ${sentAt}`,
            body:   issueBody,
            labels: ['contact-form'],
          }),
        }).catch(() => { /* silent – issue is best-effort backup */ });
      }

      // GA4 event
      if (typeof gtag === 'function') {
        gtag('event', 'form_submit', { event_category: 'Contact', value: 1 });
      }

      btn.textContent = 'Message sent!';
      btn.style.background = 'var(--clr-green)';
      btn.style.color = '#fff';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled    = getRemainingSubmits() <= 0;
        btn.style.background = '';
        btn.style.color = '';
        contactForm.reset();
      }, 4000);

    } catch (err) {
      console.error('❌ Form submission failed:', err);
      alert(`Error: ${err.message}\n\nCheck console (F12) for details.`);
      
      btn.textContent = 'Error – please email me directly';
      btn.style.background = '#b83a2a';
      btn.style.color = '#fff';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled    = false;
        btn.style.background = '';
        btn.style.color = '';
      }, 5000);
    }
  });
}

// ===========================
// Init
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  typeLoop();
  updateActiveLink();
});

// ===========================
// SmartHome Demo – toggles
// ===========================
document.querySelectorAll('.sh-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const isOn = btn.classList.toggle('on');
    btn.textContent = isOn ? 'ON' : 'OFF';
    btn.setAttribute('aria-pressed', String(isOn));
  });
});

// SmartHome Demo – temperature slider
document.querySelectorAll('.sh-slider').forEach((slider) => {
  const row = slider.closest('.sh-temp-row');
  if (!row) return;
  const valEl = row.querySelector('.sh-temp-val');
  const update = () => {
    const v = parseFloat(slider.value).toFixed(1);
    if (valEl) valEl.textContent = `${v}\u00b0C`;
  };
  slider.addEventListener('input', update);
  update();
});

// ===========================
// Encrypted Chat Demo
// ===========================
const BASE_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';

function fakeEncrypt(text) {
  const len = Math.max(20, text.length * 2);
  let out = '';
  for (let i = 0; i < len; i++) {
    out += BASE_CHARS[Math.floor(Math.random() * BASE_CHARS.length)];
  }
  return out.slice(0, 28) + '==';
}

function appendEcMsg(container, cls, text) {
  const el = document.createElement('div');
  el.className = 'ec-msg ' + cls;
  el.textContent = text;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
  return el;
}

const ecSendBtn = document.getElementById('ec-send');
const ecInput   = document.getElementById('ec-text-input');
const ecMsgs    = document.getElementById('ec-msgs');

if (ecSendBtn && ecInput && ecMsgs) {
  function sendEcMessage() {
    const raw = ecInput.value.trim();
    if (!raw) return;
    ecInput.value = '';

    appendEcMsg(ecMsgs, 'ec-right', raw);

    setTimeout(() => {
      appendEcMsg(ecMsgs, 'ec-left', fakeEncrypt(raw));
      setTimeout(() => {
        appendEcMsg(ecMsgs, 'ec-system', '// SHA-256 registered in blockchain');
      }, 550);
    }, 280);
  }

  ecSendBtn.addEventListener('click', sendEcMessage);
  ecInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendEcMessage();
  });
}

// ===========================
// Reservation Demo – slot selection
// ===========================
document.querySelectorAll('.res-slots').forEach((grid) => {
  grid.querySelectorAll('.res-slot:not([disabled])').forEach((slot) => {
    slot.addEventListener('click', () => {
      grid.querySelectorAll('.res-slot').forEach((s) => {
        s.classList.remove('res-slot-sel');
        s.removeAttribute('aria-pressed');
      });
      slot.classList.add('res-slot-sel');
      slot.setAttribute('aria-pressed', 'true');
    });
  });
});

// ===========================
// Google Analytics 4 – click tracking
// (events appear in GA4 → Reports → Engagement → Events)
// ===========================
function ga(name, params) {
  if (typeof gtag === 'function') gtag('event', name, params);
}

// Hero CTAs
document.querySelectorAll('.hero-cta .btn').forEach((btn) => {
  btn.addEventListener('click', () =>
    ga('cta_click', { event_category: 'Hero', event_label: btn.textContent.trim() })
  );
});

// Nav links
document.querySelectorAll('#nav-links a').forEach((link) => {
  link.addEventListener('click', () =>
    ga('nav_click', { event_category: 'Navigation', event_label: link.getAttribute('href') })
  );
});

// Project GitHub / Live links
document.querySelectorAll('.project-link').forEach((link) => {
  link.addEventListener('click', () =>
    ga('project_link_click', {
      event_category: 'Projects',
      event_label: link.closest('article')?.querySelector('.proj-title')?.textContent.trim() || link.textContent.trim(),
      outbound_url: link.href,
    })
  );
});

// Contact icon links (email, GitHub, LinkedIn)
document.querySelectorAll('.contact-list a').forEach((link) => {
  link.addEventListener('click', () =>
    ga('contact_click', { event_category: 'Contact', event_label: link.href })
  );
});
