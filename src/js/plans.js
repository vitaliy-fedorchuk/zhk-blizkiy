import { lockScroll } from './smooth.js';

/* ---------- «Показать еще» ----------
   Зараз у макеті 8 планувань. Коли з'являться всі 38 (CMS / JSON),
   кнопка підвантажуватиме наступну порцію. */
export function initPlansMore() {
  const grid = document.querySelector('[data-plans]');
  const btn = document.querySelector('[data-more]');
  if (!grid || !btn) return;
  const cards = [...grid.querySelectorAll('.plan-card')];
  const mobile = window.matchMedia('(max-width: 599px)').matches;
  const step = mobile ? 4 : 8;
  let shown = step;

  const apply = () => {
    cards.forEach((c, i) => c.classList.toggle('is-collapsed', i >= shown));
    btn.parentElement.hidden = shown >= cards.length;
  };

  btn.addEventListener('click', () => {
    const firstNew = cards[shown];
    shown += step;
    apply();
    firstNew?.querySelector('.plan-card__img')?.focus({ preventScroll: true });
  });

  apply();
}

/* ---------- Лайтбокс планування ---------- */
export function initLightbox() {
  const dlg = document.querySelector('[data-lightbox]');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  const img = dlg.querySelector('[data-lightbox-img]');
  const title = dlg.querySelector('[data-lightbox-title]');

  const close = () => { if (dlg.open) dlg.close(); };

  document.querySelectorAll('[data-zoom]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.plan-card');
      const src = btn.querySelector('img');
      img.src = src.currentSrc || src.src;
      img.alt = src.alt;
      title.textContent = card.querySelector('.plan-card__area')?.textContent || '';
      lockScroll(true);
      dlg.showModal();
    });
  });

  dlg.querySelectorAll('[data-lightbox-close]').forEach((b) => b.addEventListener('click', close));
  dlg.addEventListener('close', () => lockScroll(false)); // і для Esc
  dlg.addEventListener('click', (e) => {
    const r = dlg.getBoundingClientRect();
    const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    if (outside) close();
  });
}
