(function () {
  const players = Array.from(document.querySelectorAll('video[data-video]'));
  const Hls = window.Hls;

  players.forEach(function (video) {
    const src = video.getAttribute('data-video');
    const box = video.closest('.player-box');
    const buttons = box ? Array.from(box.querySelectorAll('[data-play-button]')) : [];
    let hls = null;

    const ensureSource = function () {
      if (!src || video.dataset.ready === '1') {
        return;
      }

      video.dataset.ready = '1';

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }
    };

    const playVideo = function () {
      ensureSource();
      const promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    };

    buttons.forEach(function (button) {
      button.addEventListener('click', playVideo);
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      if (box) {
        box.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', function () {
      if (box) {
        box.classList.remove('is-playing');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
