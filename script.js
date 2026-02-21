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
// Contact form (static demo)
// ===========================
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = 'Sent!';
    btn.disabled = true;
    btn.style.background = 'var(--clr-accent2)';
    btn.style.color = '#000';
    setTimeout(() => {
      btn.textContent = 'Send message';
      btn.disabled = false;
      btn.style.background = '';
      btn.style.color = '';
      contactForm.reset();
    }, 3000);
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
