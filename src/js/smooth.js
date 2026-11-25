import Lenis from 'lenis';

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis = null;
const listeners = new Set();
let lastScroll = window.scrollY;

function emit(scroll) {
  const direction = scroll > lastScroll ? 1 : scroll < lastScroll ? -1 : 0;
  lastScroll = scroll;
  listeners.forEach((fn) => fn({ scroll, direction }));
}

/** Підписка на скрол (працює і з Lenis, і з нативним скролом). */
export function onScroll(fn) {
  listeners.add(fn);
  fn({ scroll: window.scrollY, direction: 0 });
  return () => listeners.delete(fn);
}

/** Блокування скролу сторінки (меню, лайтбокс). */
export function lockScroll(locked) {
  // не знімаємо блокування, поки відкрите інше вікно або меню
  if (!locked && (document.querySelector('dialog[open]') || document.querySelector('.mobile-menu.is-open'))) return;
  if (lenis) locked ? lenis.stop() : lenis.start();
  else document.documentElement.style.overflow = locked ? 'hidden' : '';
}

function headerHeight() {
  const h = document.querySelector('[data-header]');
  return h ? h.offsetHeight : 0;
}

export function scrollToTarget(target) {
  const targetY = typeof target === 'number'
    ? target
    : target.getBoundingClientRect().top + window.scrollY;
  // шапка липка — віднімаємо її висоту, щоб не перекривала початок секції
  const offset = targetY > 0 ? -headerHeight() : 0;

  if (lenis) {
    lenis.scrollTo(targetY + offset, {
      duration: 1.4,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });
  } else {
    window.scrollTo({ top: targetY + offset, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
}

export function initSmoothScroll() {
  if (!reduceMotion) {
    lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 1,
      // прокрутка всередині попапу / меню, коли сторінка зупинена
      allowNestedScroll: true,
    });
    lenis.on('scroll', ({ scroll }) => emit(scroll));
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  } else {
    window.addEventListener('scroll', () => emit(window.scrollY), { passive: true });
  }

  // Якірні посилання
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || e.defaultPrevented || link.hasAttribute('data-modal-open')) return;
    const hash = link.getAttribute('href');
    if (hash === '#') {
      // заглушки посилань (сайт забудовника, документ згоди) — не стрибаємо нагору
      e.preventDefault();
      return;
    }
    const target = hash === '#top' ? 0 : document.querySelector(hash);
    if (target === null) return;
    e.preventDefault();
    scrollToTarget(target);
    history.replaceState(null, '', hash);
  });
}
