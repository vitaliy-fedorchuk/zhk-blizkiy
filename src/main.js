import '@fontsource-variable/unbounded';
import '@fontsource-variable/montserrat';

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/sections.css';
import './styles/motion.css';

import { initSmoothScroll } from './js/smooth.js';
import { initHeader, initMenu, initStickyCta } from './js/ui.js';
import { initReveal, initHeroTitle, initCounters, initParallax } from './js/motion.js';
import { initTabs } from './js/tabs.js';
import { initPlansMore, initLightbox } from './js/plans.js';
import { initForm } from './js/form.js';
import { initMap } from './js/map.js';
import { initModals } from './js/modals.js';

initSmoothScroll();
initHeader();
initMenu();
initStickyCta();
initHeroTitle();
initCounters();
initPlansMore();
initReveal();
initParallax();
initTabs();
initLightbox();
initForm();
initMap();
initModals();
