(function () {
  var mobileButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('is-open');
      mobileButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  });

  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var searchInput = document.querySelector('[data-filter-input]');
  var typeSelect = document.querySelector('[data-filter-type]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var categorySelect = document.querySelector('[data-filter-category]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    var query = normalize(searchInput && searchInput.value);
    var typeValue = normalize(typeSelect && typeSelect.value);
    var yearValue = normalize(yearSelect && yearSelect.value);
    var categoryValue = normalize(categorySelect && categorySelect.value);

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-text'));
      var type = normalize(card.getAttribute('data-type'));
      var year = normalize(card.getAttribute('data-year'));
      var category = normalize(card.getAttribute('data-category'));
      var matched = true;

      if (query && text.indexOf(query) === -1) {
        matched = false;
      }

      if (typeValue && type.indexOf(typeValue) === -1) {
        matched = false;
      }

      if (yearValue && year !== yearValue) {
        matched = false;
      }

      if (categoryValue && category !== categoryValue) {
        matched = false;
      }

      card.classList.toggle('is-hidden', !matched);
    });
  }

  [searchInput, typeSelect, yearSelect, categorySelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  document.querySelectorAll('[data-player]').forEach(function (frame) {
    var video = frame.querySelector('video');
    var button = frame.querySelector('.player-overlay');
    var message = frame.querySelector('[data-player-message]');
    var stream = video ? video.getAttribute('data-stream') : '';
    var loaded = false;
    var hls = null;

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add('is-visible');
    }

    function prepareStream() {
      return new Promise(function (resolve, reject) {
        if (!video || !stream) {
          reject(new Error('empty'));
          return;
        }

        if (loaded) {
          resolve();
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          loaded = true;
          resolve();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            loaded = true;
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              reject(new Error(data.type || 'error'));
            }
          });
          return;
        }

        reject(new Error('unsupported'));
      });
    }

    function playVideo() {
      prepareStream().then(function () {
        return video.play();
      }).then(function () {
        frame.classList.add('is-playing');
      }).catch(function () {
        showMessage('播放失败，请稍后重试。');
      });
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        frame.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        frame.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        frame.classList.remove('is-playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
