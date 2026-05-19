'use strict';

/* ── Utility ── */
const $ = id => document.getElementById(id);

/* ══════════════════════════════════════
   SCROLL-TRIGGERED FADE ANIMATIONS
══════════════════════════════════════ */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade').forEach(el => {
  // Immediately reveal hero-section fades
  if (el.closest('.hero')) {
    setTimeout(() => el.classList.add('in'), 120);
  } else {
    observer.observe(el);
  }
});

/* ══════════════════════════════════════
   SCROLL EVENTS — HEADER + STICKY CTA
══════════════════════════════════════ */
const hdr     = $('hdr');
const bar     = $('hdr-bar');
const scta    = $('scta');
const hero    = document.querySelector('.hero');
const trustBar = document.querySelector('.trust-bar');

function getSectionBottom(el) {
  if (!el) return 0;
  return el.getBoundingClientRect().bottom + window.scrollY;
}

// Calculate trigger point once on load, recalculate on resize
let triggerPoint = 0;
function calcTrigger() {
  triggerPoint = Math.max(
    getSectionBottom(hero),
    getSectionBottom(trustBar)
  );
}
calcTrigger();
window.addEventListener('resize', calcTrigger, { passive: true });

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Header scrolled state
  hdr.classList.toggle('scrolled', scrollY > 40);

  // Scroll progress bar
  if (bar) {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (scrollY / total) * 100 : 0) + '%';
  }

  // Sticky CTA — mobile only, show after hero + trust bar
  if (scta && window.innerWidth <= 768) {
    const pastTrigger = scrollY > triggerPoint;
    scta.classList.toggle('visible', pastTrigger);
  }

}, { passive: true });

/* ══════════════════════════════════════
   MOBILE NAV BURGER
══════════════════════════════════════ */
const burger = $('burger');
const mnav   = $('mnav');

burger.addEventListener('click', function () {
  this.classList.toggle('open');
  mnav.classList.toggle('open');
});

mnav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    mnav.classList.remove('open');
  });
});

/* ══════════════════════════════════════
   SMOOTH SCROLL — ANCHOR LINKS
══════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - 80,
      behavior: 'smooth'
    });
  });
});

/* ══════════════════════════════════════
   FORM VALIDATION
══════════════════════════════════════ */
function validate(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(el => {
    const v = el.value.trim();
    let ok = !!v;
    if (el.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) ok = false;
    if (el.name === 'zip'   && v && !/^\d{5}$/.test(v))                      ok = false;
    el.classList.toggle('err', !ok);
    if (!ok) valid = false;
  });
  return valid;
}

function bindForm(formId, okId) {
  const form = $(formId);
  const ok   = $(okId);
  if (!form) return;

  // Live validation feedback
  form.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('blur',  ()  => validate(form));
    el.addEventListener('input', ()  => { if (el.classList.contains('err')) el.classList.remove('err'); });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate(form)) return;

    const btn = form.querySelector('button[type=submit]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        form.style.display = 'none';
        ok.style.display = 'block';
      } else {
        throw new Error('Server error');
      }
    } catch {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

bindForm('hform', 'hok');
bindForm('bform', 'bok');

/* ══════════════════════════════════════
   INPUT FORMATTERS
══════════════════════════════════════ */
// ZIP: digits only, max 5
document.querySelectorAll('input[name=zip]').forEach(i => {
  i.addEventListener('input', () => {
    i.value = i.value.replace(/\D/g, '').slice(0, 5);
  });
});

// Phone: auto-format (xxx) xxx-xxxx
document.querySelectorAll('input[type=tel]').forEach(i => {
  i.addEventListener('input', () => {
    const v = i.value.replace(/\D/g, '').slice(0, 10);
    if      (v.length >= 7) i.value = `(${v.slice(0,3)}) ${v.slice(3,6)}-${v.slice(6)}`;
    else if (v.length >= 4) i.value = `(${v.slice(0,3)}) ${v.slice(3)}`;
    else                    i.value = v;
  });
});

/* ══════════════════════════════════════
   REVIEW CARDS — DRAG TO SCROLL
══════════════════════════════════════ */
const revScroll = document.querySelector('.rev-scroll');
if (revScroll) {
  let isDragging = false;
  let startX, scrollLeft;

  revScroll.addEventListener('mousedown', e => {
    isDragging = true;
    revScroll.style.cursor = 'grabbing';
    startX     = e.pageX - revScroll.offsetLeft;
    scrollLeft = revScroll.scrollLeft;
  });

  ['mouseleave', 'mouseup'].forEach(ev => {
    revScroll.addEventListener(ev, () => {
      isDragging = false;
      revScroll.style.cursor = 'grab';
    });
  });

  revScroll.addEventListener('mousemove', e => {
    if (!isDragging) return;
    e.preventDefault();
    revScroll.scrollLeft = scrollLeft - (e.pageX - revScroll.offsetLeft - startX) * 1.4;
  });
}

/* ══════════════════════════════════════
   BEFORE / AFTER COMPARISON SLIDERS
══════════════════════════════════════ */
document.querySelectorAll('.ba-wrap').forEach(wrap => {
  const after  = wrap.querySelector('.ba-after');
  const handle = wrap.querySelector('.ba-handle');
  let active = false;

  function applyPos(clientX) {
    const rect = wrap.getBoundingClientRect();
    let pct    = ((clientX - rect.left) / rect.width) * 100;
    pct        = Math.min(97, Math.max(3, pct));
    after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left    = pct + '%';
  }

  // Mouse
  wrap.addEventListener('mousedown', e => {
    active = true;
    applyPos(e.clientX);
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (active) applyPos(e.clientX);
  });
  window.addEventListener('mouseup', () => { active = false; });

  // Touch
  wrap.addEventListener('touchstart', e => {
    active = true;
    applyPos(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (active) applyPos(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchend', () => { active = false; });
});