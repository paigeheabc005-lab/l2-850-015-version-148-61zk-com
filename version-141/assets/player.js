import { H as Hls } from './hls.js';

export function bootMoviePlayer(videoUrl) {
  const video = document.querySelector('.js-video');
  const cover = document.querySelector('.js-play-cover');
  const error = document.querySelector('.js-player-error');
  let hls = null;
  let ready = false;

  if (!video || !cover || !videoUrl) {
    return;
  }

  function showError() {
    if (error) {
      error.textContent = '暂时无法播放，请稍后再试';
      error.classList.add('show');
    }
  }

  function attach() {
    if (ready) {
      return true;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      ready = true;
      return true;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      if (Hls.Events && Hls.Events.ERROR) {
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data && data.fatal) {
            showError();
          }
        });
      }
      ready = true;
      return true;
    }

    showError();
    return false;
  }

  async function play() {
    if (!attach()) {
      return;
    }
    cover.style.display = 'none';
    video.controls = true;
    try {
      await video.play();
    } catch (_error) {
      cover.style.display = '';
    }
  }

  cover.addEventListener('click', play);
  cover.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      play();
    }
  });
  video.addEventListener('click', () => {
    if (!ready || video.paused) {
      play();
      return;
    }
    video.pause();
  });
  video.addEventListener('error', showError);
  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
