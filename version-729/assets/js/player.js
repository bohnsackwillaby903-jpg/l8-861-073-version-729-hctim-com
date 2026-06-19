document.addEventListener("DOMContentLoaded", function () {
  var player = document.querySelector("[data-player]");
  if (!player) {
    return;
  }

  var video = player.querySelector("video");
  var overlay = player.querySelector(".player-overlay");
  var startButton = player.querySelector(".player-start");
  var streamUrl = player.getAttribute("data-stream");
  var hls = null;
  var ready = false;

  function attachStream() {
    if (!video || !streamUrl || ready) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      ready = true;
      return;
    }

    video.src = streamUrl;
    ready = true;
  }

  function startPlayback(event) {
    if (event) {
      event.preventDefault();
    }
    attachStream();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    video.setAttribute("controls", "controls");
    var playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (startButton) {
    startButton.addEventListener("click", startPlayback);
  }
  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }
  if (video) {
    video.addEventListener("click", function () {
      if (video.paused && !ready) {
        startPlayback();
      }
    });
  }
});
