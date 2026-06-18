(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let current = 0;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  const toolbars = document.querySelectorAll('[data-filter-scope]');

  toolbars.forEach(function (scope) {
    const input = scope.querySelector('[data-filter-input]');
    const select = scope.querySelector('[data-sort-select]');
    const grid = scope.querySelector('[data-movie-grid]');
    const empty = scope.querySelector('[data-empty-state]');

    if (!grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll('.movie-card'));

    const apply = function () {
      const query = input ? input.value.trim().toLowerCase() : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = [card.dataset.title, card.dataset.category, card.dataset.keywords, card.dataset.year].join(' ').toLowerCase();
        const matched = !query || haystack.indexOf(query) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    };

    const sortCards = function () {
      if (!select) {
        return;
      }

      const value = select.value;
      const sorted = cards.slice().sort(function (a, b) {
        if (value === 'score') {
          return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
        }
        if (value === 'year') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
      });

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    };

    if (input) {
      input.addEventListener('input', apply);
    }

    if (select) {
      select.addEventListener('change', function () {
        sortCards();
        apply();
      });
    }
  });
})();
