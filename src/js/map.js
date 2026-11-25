/* Яндекс Карта: ліниве завантаження iframe + «клік для керування»,
   щоб колесо миші над картою не перехоплювало скрол сторінки. */
export function initMap() {
  const map = document.querySelector('[data-map]');
  if (!map) return;
  const frame = map.querySelector('[data-map-frame]');
  const activate = map.querySelector('[data-map-activate]');
  const src = frame?.dataset.mapSrc;
  if (!src) return;

  const load = () => {
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = 'Карта: ЖК «Близкий», Батайск, Авиагородок';
    iframe.loading = 'lazy';
    iframe.allowFullscreen = true;
    iframe.addEventListener('load', () => map.classList.add('is-loaded'), { once: true });
    frame.append(iframe);
  };

  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { io.disconnect(); load(); }
  }, { rootMargin: '400px 0px' });
  io.observe(map);

  const setActive = (on) => map.classList.toggle('is-active', on);
  activate.addEventListener('click', () => setActive(true));
  map.addEventListener('mouseleave', () => setActive(false));
  document.addEventListener('pointerdown', (e) => {
    if (!map.contains(e.target)) setActive(false);
  });
}
