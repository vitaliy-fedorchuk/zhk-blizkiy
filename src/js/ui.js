import { onScroll, lockScroll } from './smooth.js';

/* ---------- Шапка: тінь, ховання при скролі вниз, прогрес ---------- */
export function initHeader() {
  const header = document.querySelector('[data-header]');
  const progress = document.querySelector('.scroll-progress span');
  if (!header) return;

  onScroll(({ scroll, direction }) => {
    header.classList.toggle('is-scrolled', scroll > 8);
    if (scroll < 240 || direction < 0) header.classList.remove('is-hidden');
    else if (direction > 0) header.classList.add('is-hidden');

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.setProperty('--p', max > 0 ? (scroll / max).toFixed(4) : 0);
    }
  });

  // Підсвітка активного пункту меню
  const links = [...document.querySelectorAll('.nav__link')];
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const link = map.get(entry.target.id);
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach((l) => l.classList.remove('is-active'));
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, id) => {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  });
}

/* ---------- Мобільне меню ---------- */
export function initMenu() {
  const burger = document.querySelector('[data-burger]');
  const menu = document.querySelector('[data-menu]');
  const header = document.querySelector('[data-header]');
  if (!burger || !menu) return;

  let open = false;
  const set = (state) => {
    if (open === state) return;
    open = state;
    burger.setAttribute('aria-expanded', String(state));
    burger.setAttribute('aria-label', state ? 'Закрыть меню' : 'Открыть меню');
    menu.classList.toggle('is-open', state);
    menu.inert = !state;
    header.classList.toggle('menu-open', state);
    lockScroll(state);
  };

  burger.addEventListener('click', () => set(!open));
  // закриваємо до того, як глобальний обробник якорів почне скрол
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) { set(false); burger.focus(); }
  });
  window.matchMedia('(min-width: 1280px)').addEventListener('change', (e) => { if (e.matches) set(false); });
}

/* ---------- Липка кнопка заявки на мобільному ---------- */
export function initStickyCta() {
  const bar = document.querySelector('[data-sticky-cta]');
  if (!bar) return;
  const watched = ['#top', '#contact', 'footer'].map((s) => document.querySelector(s)).filter(Boolean);
  const visible = new Set();

  const update = () => {
    const show = visible.size === 0;
    bar.classList.toggle('is-visible', show);
    bar.setAttribute('aria-hidden', String(!show));
    bar.querySelectorAll('a').forEach((a) => (a.tabIndex = show ? 0 : -1));
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    update();
  }, { rootMargin: '0px 0px -10% 0px' });
  watched.forEach((el) => io.observe(el));
}
