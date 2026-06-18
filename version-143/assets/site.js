
(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    if (!slides.length) return;
    let index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', (i % slides.length) === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i % slides.length);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  });

  document.querySelectorAll('[data-filter-list]').forEach(function (scope) {
    const input = scope.querySelector('[data-filter-input]');
    const select = scope.querySelector('[data-sort-select]');
    const grid = scope.querySelector('[data-card-grid]');
    const empty = scope.querySelector('[data-empty]');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('[data-card]'));

    function applyFilter() {
      const q = input ? input.value.trim().toLowerCase() : '';
      let shown = 0;
      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();
        const matched = !q || haystack.indexOf(q) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) shown += 1;
      });
      if (empty) {
        empty.classList.toggle('show', shown === 0);
      }
    }

    function applySort() {
      if (!select) return;
      const value = select.value;
      const sorted = cards.slice().sort(function (a, b) {
        if (value === 'year') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        if (value === 'title') {
          return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
        }
        return Number(a.dataset.seq || 0) - Number(b.dataset.seq || 0);
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      applyFilter();
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (select) {
      select.addEventListener('change', applySort);
    }
    applySort();
  });

  function attachStream(video, stream) {
    if (!video || !stream) return;
    if (video.dataset.ready === stream) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.dataset.ready = stream;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (video._hlsPlayer) {
        video._hlsPlayer.destroy();
      }
      const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hlsPlayer = hls;
      video.dataset.ready = stream;
      return;
    }
    video.src = stream;
    video.dataset.ready = stream;
  }

  document.querySelectorAll('[data-play-button]').forEach(function (button) {
    const videoId = button.getAttribute('data-video');
    const stream = button.getAttribute('data-stream');
    const video = document.getElementById(videoId);
    const start = function () {
      attachStream(video, stream);
      button.classList.add('hidden');
      if (video) {
        video.controls = true;
        const playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === 'function') {
          playAttempt.catch(function () {});
        }
      }
    };
    button.addEventListener('click', start);
    if (video) {
      video.addEventListener('click', function () {
        if (!video.dataset.ready) start();
      });
    }
  });
})();
