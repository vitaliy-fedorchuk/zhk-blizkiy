import { lockScroll, reduceMotion } from './smooth.js';

/* Попапи як на поточному сайті:
   - «request»: відкривається з усіх кнопок [data-modal-open="request"];
   - «promo»: відкривається сам через 10 секунд після завантаження;
   - закриття: хрестик, клік по затемненню, Esc.
   Промо показуємо один раз за сесію і не показуємо, якщо заявку вже відправлено
   або відкрите інше вікно / меню (тоді пробуємо пізніше). */
const PROMO_DELAY = 10000;
const PROMO_RETRY = 5000;
const PROMO_KEY = 'zhk-promo-shown';

const storage = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* приватний режим */ } },
};

export function initModals() {
  const modals = new Map([...document.querySelectorAll('[data-modal]')].map((m) => [m.dataset.modal, m]));
  if (!modals.size) return;
  let opener = null;

  const open = (name) => {
    const modal = modals.get(name);
    if (!modal || modal.open) return;
    document.querySelectorAll('dialog[open]').forEach((d) => d.close());
    opener = document.activeElement;
    modal.classList.remove('is-closing');
    modal.querySelector('.form__success')?.setAttribute('hidden', '');
    modal.showModal();
    lockScroll(true);
  };

  const close = (modal) => {
    if (!modal.open || modal.classList.contains('is-closing')) return;
    modal.classList.add('is-closing');
    setTimeout(() => modal.close(), reduceMotion ? 0 : 300);
  };

  modals.forEach((modal) => {
    modal.addEventListener('cancel', (e) => { e.preventDefault(); close(modal); }); // Esc
    modal.addEventListener('close', () => {
      modal.classList.remove('is-closing');
      lockScroll(false);
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
      opener = null;
    });
    modal.querySelectorAll('[data-modal-close]').forEach((el) => el.addEventListener('click', () => close(modal)));
  });

  // делегування: кнопки можуть з'являтися динамічно (CMS)
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-modal-open]');
    if (!trigger) return;
    e.preventDefault();
    open(trigger.dataset.modalOpen);
  });

  // Автовідкриття промо
  if (!modals.has('promo') || storage.get(PROMO_KEY)) return;
  const tryPromo = () => {
    if (document.documentElement.dataset.leadSent) return;
    const busy = document.querySelector('dialog[open]') || document.querySelector('.mobile-menu.is-open');
    if (busy) { setTimeout(tryPromo, PROMO_RETRY); return; }
    storage.set(PROMO_KEY, '1');
    open('promo');
  };
  setTimeout(tryPromo, PROMO_DELAY);
}
