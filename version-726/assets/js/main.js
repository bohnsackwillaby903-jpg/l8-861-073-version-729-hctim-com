(function () {
  var siteHeader = document.querySelector('.site-header');
  var menuToggle = document.querySelector('.menu-toggle');

  if (menuToggle && siteHeader) {
    menuToggle.addEventListener('click', function () {
      var open = siteHeader.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', open);
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function startAuto() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
        startAuto();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        startAuto();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        startAuto();
      });
    }

    startAuto();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var keywordInput = panel.querySelector('[data-filter-keyword]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var resetButton = panel.querySelector('[data-filter-reset]');
    var scope = panel.closest('main') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var empty = scope.querySelector('[data-empty-result]');

    function applyFilter() {
      var keyword = (keywordInput && keywordInput.value || '').trim().toLowerCase();
      var year = yearSelect && yearSelect.value || '';
      var type = typeSelect && typeSelect.value || '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (keywordInput) {
      keywordInput.addEventListener('input', applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilter);
    }

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (keywordInput) {
          keywordInput.value = '';
        }

        if (yearSelect) {
          yearSelect.value = '';
        }

        if (typeSelect) {
          typeSelect.value = '';
        }

        applyFilter();
      });
    }
  });

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader]');

    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      existing.addEventListener('error', callback, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    script.addEventListener('error', callback, { once: true });
    document.head.appendChild(script);
  }

  function safePlay(video) {
    var result = video.play();

    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  }

  window.SitePlayer = {
    setup: function (config) {
      var video = document.querySelector(config.selector);
      var button = document.querySelector(config.buttonSelector);
      var overlay = document.querySelector(config.overlaySelector);
      var hlsInstance = null;
      var attached = false;
      var pendingPlay = false;

      if (!video || !config.source) {
        return;
      }

      function hideOverlay() {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }

        video.controls = true;
      }

      function attachNative() {
        video.src = config.source;
        attached = true;

        if (pendingPlay) {
          safePlay(video);
        }
      }

      function attachHls() {
        loadHls(function () {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: false
            });

            hlsInstance.loadSource(config.source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              if (pendingPlay) {
                safePlay(video);
              }
            });
            hlsInstance.on(window.Hls.Events.ERROR, function () {
              if (!video.src) {
                video.src = config.source;
              }
            });
            attached = true;
          } else {
            attachNative();
          }
        });
      }

      function attachStream() {
        if (attached) {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          attachNative();
        } else {
          attachHls();
        }
      }

      function start() {
        pendingPlay = true;
        hideOverlay();
        attachStream();

        if (attached) {
          safePlay(video);
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }

      if (overlay) {
        overlay.addEventListener('click', start);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  };
})();
