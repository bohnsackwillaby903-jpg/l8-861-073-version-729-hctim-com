(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function() {
        mobileNav.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var currentSlide = 0;
    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === currentSlide);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === currentSlide);
      });
    }
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        showSlide(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function() {
        showSlide(currentSlide + 1);
      }, 5200);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var movieCards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var activeFilter = 'all';

    function applyMovieFilter() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var visible = 0;
      movieCards.forEach(function(card) {
        var text = (card.getAttribute('data-keywords') || '').toLowerCase();
        var channel = card.getAttribute('data-channel') || '';
        var matchText = !keyword || text.indexOf(keyword) !== -1;
        var matchFilter = activeFilter === 'all' || channel === activeFilter;
        var show = matchText && matchFilter;
        card.classList.toggle('is-hidden-card', !show);
        if (show) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (searchInput && movieCards.length) {
      searchInput.addEventListener('input', applyMovieFilter);
    }

    filterButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        activeFilter = button.getAttribute('data-filter') || 'all';
        filterButtons.forEach(function(item) {
          item.classList.toggle('is-active', item === button);
        });
        applyMovieFilter();
      });
    });

    Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(function(player) {
      var video = player.querySelector('video');
      var starter = player.querySelector('.player-start');
      var streamUrl = player.getAttribute('data-stream');
      var attached = false;
      var hlsInstance = null;

      if (!video || !starter || !streamUrl) {
        return;
      }

      function runPlay() {
        var action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function() {
            starter.classList.remove('is-hidden');
          });
        }
      }

      function attachStream(afterReady) {
        if (attached) {
          afterReady();
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          attached = true;
          afterReady();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
            afterReady();
          });
          attached = true;
          return;
        }
        video.src = streamUrl;
        attached = true;
        afterReady();
      }

      function start() {
        starter.classList.add('is-hidden');
        video.controls = true;
        attachStream(runPlay);
      }

      starter.addEventListener('click', start);
      video.addEventListener('click', function() {
        if (video.paused) {
          start();
        }
      });
      window.addEventListener('beforeunload', function() {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
