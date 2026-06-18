import { H as Hls } from './hls.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMenu() {
  const toggle = $('.menu-toggle');
  const panel = $('.mobile-panel');
  if (!toggle || !panel) return;
  toggle.addEventListener('click', () => {
    const open = panel.classList.toggle('is-open');
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
}

function setupSearchForms() {
  $$('.site-search').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = $('input', form);
      const query = input ? input.value.trim() : '';
      const target = query ? `search.html?q=${encodeURIComponent(query)}` : 'search.html';
      window.location.href = target;
    });
  });
}

function setupHero() {
  const hero = $('.hero');
  if (!hero) return;
  const slides = $$('.hero-slide', hero);
  const dots = $$('.hero-dot', hero);
  if (slides.length <= 1) return;
  let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
  let timer = null;
  const show = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };
  const restart = () => {
    if (timer) window.clearInterval(timer);
    timer = window.setInterval(() => show(index + 1), 5200);
  };
  $('.hero-prev', hero)?.addEventListener('click', () => {
    show(index - 1);
    restart();
  });
  $('.hero-next', hero)?.addEventListener('click', () => {
    show(index + 1);
    restart();
  });
  dots.forEach((dot, i) => dot.addEventListener('click', () => {
    show(i);
    restart();
  }));
  show(index);
  restart();
}

function normalizeText(value) {
  return (value || '').toString().toLowerCase().replace(/\s+/g, '');
}

function setupFilters() {
  const input = $('.filter-input');
  const typeSelect = $('.filter-type');
  const yearSelect = $('.filter-year');
  const categorySelect = $('.filter-category');
  const cards = $$('.movie-card[data-search]');
  if (!cards.length) return;

  const urlQuery = new URLSearchParams(window.location.search).get('q');
  if (input && urlQuery) input.value = urlQuery;

  const apply = () => {
    const q = normalizeText(input ? input.value : '');
    const type = typeSelect ? typeSelect.value : '';
    const year = yearSelect ? yearSelect.value : '';
    const category = categorySelect ? categorySelect.value : '';
    cards.forEach((card) => {
      const text = normalizeText(card.getAttribute('data-search'));
      const cardType = card.getAttribute('data-type') || '';
      const cardYear = card.getAttribute('data-year') || '';
      const cardCategory = card.getAttribute('data-category') || '';
      const visible = (!q || text.includes(q)) && (!type || cardType === type) && (!year || cardYear === year) && (!category || cardCategory === category);
      card.classList.toggle('hidden-card', !visible);
    });
  };

  [input, typeSelect, yearSelect, categorySelect].forEach((node) => {
    if (node) node.addEventListener(node.tagName === 'INPUT' ? 'input' : 'change', apply);
  });
  apply();
}

function setupPlayback() {
  const shell = $('.player-shell');
  const video = shell ? $('video', shell) : null;
  const button = $('.play-button');
  const message = $('.player-message');
  const config = $('#playback-config');
  if (!shell || !video || !button || !config) return;

  let url = '';
  let hls = null;
  let started = false;
  try {
    url = JSON.parse(config.textContent || '{}').url || '';
  } catch (error) {
    url = '';
  }

  const showMessage = () => {
    if (message) {
      message.textContent = '暂时无法播放，请稍后再试';
      message.classList.add('is-visible');
    }
  };

  const start = () => {
    if (!url) {
      showMessage();
      return;
    }
    shell.classList.add('is-playing');
    video.controls = true;
    if (!started) {
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(() => {});
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data && data.fatal) showMessage();
        });
        video.play().catch(() => {});
      } else {
        showMessage();
      }
    } else {
      video.play().catch(() => {});
    }
  };

  button.addEventListener('click', start);
  shell.addEventListener('click', (event) => {
    if (event.target === video && video.controls) return;
    if (video.paused) start();
  });
  video.addEventListener('play', () => shell.classList.add('is-playing'));
  video.addEventListener('pause', () => {
    if (!video.ended) return;
    shell.classList.remove('is-playing');
  });
  window.addEventListener('beforeunload', () => {
    if (hls) hls.destroy();
  });
}

setupMenu();
setupSearchForms();
setupHero();
setupFilters();
setupPlayback();
