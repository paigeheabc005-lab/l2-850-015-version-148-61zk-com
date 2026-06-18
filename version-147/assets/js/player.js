import { H as Hls } from "./hls.js";

export function initMoviePlayer(streamUrl) {
  const shell = document.querySelector("[data-player]");
  if (!shell) {
    return;
  }

  const video = shell.querySelector("video");
  const overlay = shell.querySelector("[data-play-overlay]");
  const button = shell.querySelector("[data-play-button]");
  const status = shell.querySelector("[data-player-status]");
  let hls = null;
  let ready = false;

  function setStatus(text) {
    if (status) {
      status.textContent = text || "";
    }
  }

  function bindStream() {
    if (ready || !video) {
      return;
    }
    ready = true;
    setStatus("正在准备播放...");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener(
        "loadedmetadata",
        function () {
          setStatus("");
        },
        { once: true },
      );
      video.addEventListener("error", function () {
        setStatus("视频加载失败，请稍后再试");
      });
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus("");
      });
      hls.on(Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          setStatus("视频加载失败，请稍后再试");
        }
      });
      return;
    }

    setStatus("当前浏览器不支持播放");
  }

  function playMovie() {
    bindStream();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    video.controls = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", playMovie);
  }
  if (button) {
    button.addEventListener("click", playMovie);
  }
  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
