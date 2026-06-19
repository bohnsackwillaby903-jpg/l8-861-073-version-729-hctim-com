(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobileNav.classList.toggle('open');
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
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  function applyFilters(section) {
    var input = section.querySelector('.filter-input');
    var typeSelect = section.querySelector('.filter-type');
    var yearSelect = section.querySelector('.filter-year');
    var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
    var keyword = input ? input.value.trim().toLowerCase() : '';
    var type = typeSelect ? typeSelect.value : '';
    var year = yearSelect ? yearSelect.value : '';

    cards.forEach(function (card) {
      var haystack = card.getAttribute('data-keywords') || '';
      var cardType = card.getAttribute('data-type') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
      var typeMatch = !type || cardType.indexOf(type) !== -1;
      var yearMatch = !year || cardYear === year;
      card.classList.toggle('is-hidden', !(keywordMatch && typeMatch && yearMatch));
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.listing-section')).forEach(function (section) {
    Array.prototype.slice.call(section.querySelectorAll('.filter-input, .filter-type, .filter-year')).forEach(function (control) {
      control.addEventListener('input', function () {
        applyFilters(section);
      });
      control.addEventListener('change', function () {
        applyFilters(section);
      });
    });
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');
  if (query) {
    var searchInput = document.querySelector('.all-search-grid') ? document.querySelector('.filter-input') : null;
    var searchSection = document.querySelector('.listing-section');
    if (searchInput && searchSection) {
      searchInput.value = query;
      applyFilters(searchSection);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var videoUrl = shell.getAttribute('data-video');
    var hlsInstance = null;
    var loaded = false;

    function startVideo() {
      if (!video || !videoUrl) {
        return;
      }

      shell.classList.add('playing');
      video.controls = true;

      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(videoUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = videoUrl;
        }
        loaded = true;
      }

      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          startVideo();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });

  var backTop = document.querySelector('.back-top');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('show', window.scrollY > 480);
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}());
