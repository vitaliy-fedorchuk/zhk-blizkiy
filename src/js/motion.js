import { onScroll, reduceMotion } from './smooth.js';

/* ---------- Slide-up reveal при скролі ---------- */
export function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => { el.classList.add('is-visible', 'is-done'); el.removeAttribute('data-reveal'); });
    return;
  }

  const io = new IntersectionObserver((entries) => {
    // елементи, що з'явились одночасно, отримують каскадну затримку
    const batch = entries
      .filter((e) => e.isIntersecting)
      .map((e) => e.target)
      .sort((a, b) => {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        return (ra.top - rb.top) || (ra.left - rb.left);
      });

    batch.forEach((el, i) => {
      const d = Math.min(i, 8);
      el.style.setProperty('--d', d);
      el.classList.add('is-visible');
      io.unobserve(el);
      const total = (el.dataset.reveal === 'media' ? 1900 : 1250) + d * 90;
      setTimeout(() => {
        // знімаємо reveal-стани, щоб працювали власні hover-transition
        el.removeAttribute('data-reveal');
        el.style.removeProperty('--d');
        el.classList.add('is-done');
      }, total);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  items.forEach((el) => io.observe(el));

  // Схема інфраструктури
  const orbit = document.querySelector('[data-orbit]');
  if (orbit) {
    const oio = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { orbit.classList.add('is-visible'); oio.disconnect(); }
    }, { threshold: 0.3 });
    oio.observe(orbit);
  }
}

/* ---------- Заголовок першого екрана: fit + поява по літерах ---------- */
export function initHeroTitle() {
  const h = document.querySelector('[data-fit]');
  if (!h) return;
  const inner = h.querySelector('.hero__title-inner');

  if (h.hasAttribute('data-split') && !reduceMotion) {
    const text = inner.textContent;
    inner.textContent = '';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'char';
      s.style.setProperty('--ci', i);
      s.textContent = ch === ' ' ? ' ' : ch;
      inner.append(s);
    });
  }

  // Підганяємо розмір: один рядок на всю ширину колонки контенту
  const fit = () => {
    h.style.fontSize = '100px';
    const avail = h.clientWidth;
    const w = inner.offsetWidth;
    if (w > 0) h.style.fontSize = `${(100 * avail) / w}px`;
  };

  fit();
  let raf;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(fit);
  });

  const show = () => requestAnimationFrame(() => h.classList.add('is-visible'));
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { fit(); show(); });
    setTimeout(show, 1500); // страховка, якщо шрифти довго вантажаться
  } else {
    show();
  }
}

/* ---------- Лічильники цифр ---------- */
export function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (reduceMotion || !els.length) return;
  const numRe = /\d+(?:[\s  ]\d{3})*/g;
  const ease = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  els.forEach((el) => {
    const original = el.textContent;
    const parts = [];
    let last = 0;
    original.replace(numRe, (m, idx) => {
      parts.push(original.slice(last, idx));
      const sep = (m.match(/[\s  ]/) || [' '])[0];
      parts.push({ value: parseInt(m.replace(/\D/g, ''), 10), sep, grouped: m.length > 3 && /\D/.test(m) });
      last = idx + m.length;
      return m;
    });
    parts.push(original.slice(last));

    const fmt = (n, p) => {
      const s = String(n);
      return p.grouped ? s.replace(/\B(?=(\d{3})+(?!\d))/g, p.sep) : s;
    };
    const render = (k) => {
      el.textContent = parts.map((p) => (typeof p === 'string' ? p : fmt(Math.round(p.value * k), p))).join('');
    };

    el.dataset.countOriginal = original;
    render(0);

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const dur = 1700;
      const tick = (now) => {
        const t = Math.min((now - start) / dur, 1);
        render(ease(t));
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = original; // гарантуємо дослівний текст
      };
      setTimeout(() => requestAnimationFrame(tick), 250);
    }, { threshold: 0.6 });
    io.observe(el);
  });
}

/* ---------- Паралакс фото ---------- */
export function initParallax() {
  if (reduceMotion) return;
  const items = [...document.querySelectorAll('[data-parallax]')].map((img) => ({
    img,
    box: img.parentElement,
    speed: parseFloat(img.dataset.parallax) || 0.1,
  }));
  if (!items.length) return;

  let vh = window.innerHeight;
  window.addEventListener('resize', () => { vh = window.innerHeight; update(); });

  function update() {
    items.forEach(({ img, box, speed }) => {
      const r = box.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const delta = r.top + r.height / 2 - vh / 2;
      const max = r.height * 0.05; // запас від scale(1.12)
      const y = Math.max(-max, Math.min(max, -delta * speed));
      img.style.setProperty('--py', `${y.toFixed(1)}px`);
    });
  }
  onScroll(update);
}
