/* Доступні вкладки «Способы покупки»:
   role=tablist/tab/tabpanel, aria-selected, roving tabindex,
   стрілки / Home / End, автоматична активація. */
export function initTabs() {
  const root = document.querySelector('[data-tabs]');
  if (!root) return;
  const list = root.querySelector('[role="tablist"]');
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  const panelOf = (tab) => document.getElementById(tab.getAttribute('aria-controls'));

  // орієнтація залежить від брейкпоінта (на мобільному — горизонтальна стрічка)
  const mq = window.matchMedia('(max-width: 879px)');
  const setOrientation = () => list.setAttribute('aria-orientation', mq.matches ? 'horizontal' : 'vertical');
  setOrientation();
  mq.addEventListener('change', setOrientation);

  function select(index, { focus = false } = {}) {
    tabs.forEach((tab, i) => {
      const on = i === index;
      const panel = panelOf(tab);
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && panel.hidden) {
        panel.hidden = false;
        panel.classList.remove('is-entering');
        void panel.offsetWidth; // перезапуск анімації
        panel.classList.add('is-entering');
      } else if (!on) {
        panel.hidden = true;
      }
    });
    const tab = tabs[index];
    if (focus) tab.focus({ preventScroll: true });
    // у горизонтальній стрічці підкручуємо активну вкладку у видиму зону
    if (list.scrollWidth > list.clientWidth) {
      const pad = parseFloat(getComputedStyle(list).paddingLeft) || 0;
      list.scrollTo({ left: tab.offsetLeft - pad, behavior: 'smooth' });
    }
  }

  tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i)));

  list.addEventListener('keydown', (e) => {
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    let next = null;
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight': next = (current + 1) % tabs.length; break;
      case 'ArrowUp':
      case 'ArrowLeft': next = (current - 1 + tabs.length) % tabs.length; break;
      case 'Home': next = 0; break;
      case 'End': next = tabs.length - 1; break;
      default: return;
    }
    e.preventDefault();
    select(next, { focus: true });
  });
}
