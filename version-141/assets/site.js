(() => {
  const header = document.querySelector('.js-site-header');
  const toggle = document.querySelector('.js-mobile-toggle');
  const mobileNav = document.querySelector('.js-mobile-nav');

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && mobileNav && header) {
    toggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      header.classList.toggle('menu-open', open);
      toggle.textContent = open ? '×' : '☰';
    });
  }

  const hero = document.querySelector('.js-hero-carousel');
  if (hero) {
    const slides = [...hero.querySelectorAll('.hero-slide')];
    const dots = [...hero.querySelectorAll('.hero-dot')];
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(() => show(current + 1), 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        stop();
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  const filterForms = [...document.querySelectorAll('.js-filter-form')];

  function applyFilters(form) {
    const scope = form.closest('main') || document;
    const cards = [...scope.querySelectorAll('.js-filter-card')];
    const input = form.querySelector('.js-filter-input');
    const category = form.querySelector('.js-filter-category');
    const year = form.querySelector('.js-filter-year');
    const type = form.querySelector('.js-filter-type');
    const result = scope.querySelector('.js-filter-result');
    const empty = scope.querySelector('.js-empty-state');
    const text = input ? input.value.trim().toLowerCase() : '';
    const categoryValue = category ? category.value : '';
    const yearValue = year ? year.value : '';
    const typeValue = type ? type.value : '';
    let count = 0;

    cards.forEach((card) => {
      const search = (card.dataset.search || '').toLowerCase();
      const title = (card.dataset.title || '').toLowerCase();
      const matchText = !text || search.includes(text) || title.includes(text);
      const matchCategory = !categoryValue || card.dataset.category === categoryValue;
      const matchYear = !yearValue || card.dataset.year === yearValue;
      const matchType = !typeValue || card.dataset.type === typeValue;
      const show = matchText && matchCategory && matchYear && matchType;
      card.style.display = show ? '' : 'none';
      if (show) {
        count += 1;
      }
    });

    if (result) {
      result.textContent = count ? `已显示 ${count} 部影片` : '暂无匹配影片';
    }
    if (empty) {
      empty.classList.toggle('show', count === 0);
    }
  }

  filterForms.forEach((form) => {
    const params = new URLSearchParams(window.location.search);
    const input = form.querySelector('.js-filter-input');
    const category = form.querySelector('.js-filter-category');
    const year = form.querySelector('.js-filter-year');
    const type = form.querySelector('.js-filter-type');

    if (input && params.has('q')) {
      input.value = params.get('q') || '';
    }
    if (category && params.has('category')) {
      category.value = params.get('category') || '';
    }
    if (year && params.has('year')) {
      year.value = params.get('year') || '';
    }
    if (type && params.has('type')) {
      type.value = params.get('type') || '';
    }

    form.addEventListener('submit', (event) => {
      if (form.classList.contains('js-filter-form')) {
        event.preventDefault();
        applyFilters(form);
      }
    });

    form.querySelectorAll('input, select').forEach((field) => {
      field.addEventListener('input', () => applyFilters(form));
      field.addEventListener('change', () => applyFilters(form));
    });

    applyFilters(form);
  });
})();
