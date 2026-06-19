(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    initMobileMenu();
    initHeroCarousel();
    initFilters();
    initQuerySearch();
    initPlayers();
  });

  function initMobileMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var panel = document.querySelector(".mobile-panel");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", expanded ? "false" : "true");
      panel.hidden = expanded;
    });
  }

  function initHeroCarousel() {
    var stage = document.querySelector(".hero-stage");

    if (!stage) {
      return;
    }

    var slides = Array.prototype.slice.call(stage.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(stage.querySelectorAll(".hero-dots button"));
    var prev = stage.querySelector(".hero-prev");
    var next = stage.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    stage.addEventListener("mouseenter", stop);
    stage.addEventListener("mouseleave", start);
    start();
  }

  function normalize(text) {
    return (text || "").toString().trim().toLowerCase();
  }

  function applyFilter(input, cards) {
    var query = normalize(input.value);

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-region"),
        card.textContent
      ].join(" "));

      card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
    });
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".filter-form"));

    forms.forEach(function (form) {
      var input = form.querySelector("input[type='search']");
      var grid = form.parentElement ? form.parentElement.querySelector(".searchable-grid") : null;
      var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];

      if (!input || !cards.length) {
        return;
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter(input, cards);
      });

      input.addEventListener("input", function () {
        applyFilter(input, cards);
      });
    });
  }

  function initQuerySearch() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    var input = document.querySelector(".global-filter input[type='search']");

    if (!query || !input) {
      return;
    }

    input.value = query;
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .movie-card"));
    applyFilter(input, cards);
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var configNode = player.querySelector(".player-config");
      var config = {};

      if (!video || !configNode) {
        return;
      }

      try {
        config = JSON.parse(configNode.textContent || "{}");
      } catch (error) {
        config = {};
      }

      if (!config.url) {
        return;
      }

      function prepare() {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (!video.src) {
            video.src = config.url;
          }
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (!video.__hlsReady) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(config.url);
            hls.attachMedia(video);
            video.__hlsReady = true;
          }
          return;
        }

        if (!video.src) {
          video.src = config.url;
        }
      }

      function play() {
        prepare();
        player.classList.add("is-playing");
        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        if (!video.currentTime) {
          player.classList.remove("is-playing");
        }
      });
    });
  }
})();
