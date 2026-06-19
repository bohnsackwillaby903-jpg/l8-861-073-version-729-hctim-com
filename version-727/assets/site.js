(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, idx) {
      slide.classList.toggle('is-active', idx === currentSlide);
    });
    dots.forEach(function (dot, idx) {
      dot.classList.toggle('is-active', idx === currentSlide);
    });
  }

  function startSlides() {
    if (slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5000);
  }

  function restartSlides() {
    if (timer) {
      window.clearInterval(timer);
    }
    startSlides();
  }

  var nextButton = document.querySelector('.hero-next');
  var prevButton = document.querySelector('.hero-prev');
  if (nextButton) {
    nextButton.addEventListener('click', function () {
      showSlide(currentSlide + 1);
      restartSlides();
    });
  }
  if (prevButton) {
    prevButton.addEventListener('click', function () {
      showSlide(currentSlide - 1);
      restartSlides();
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = parseInt(dot.getAttribute('data-slide'), 10);
      if (!Number.isNaN(index)) {
        showSlide(index);
        restartSlides();
      }
    });
  });
  startSlides();

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q') || '';
  var input = document.querySelector('.filter-input');
  var queryInput = document.querySelector('.search-query-input');
  var yearSelect = document.querySelector('.filter-year');
  var typeSelect = document.querySelector('.filter-type');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));

  if (queryInput && q) {
    queryInput.value = q;
  } else if (input && q) {
    input.value = q;
  }

  function norm(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter() {
    if (!cards.length) {
      return;
    }
    var keyword = norm(input ? input.value : '');
    var year = norm(yearSelect ? yearSelect.value : '');
    var type = norm(typeSelect ? typeSelect.value : '');
    cards.forEach(function (card) {
      var text = norm(card.getAttribute('data-text'));
      var cardYear = norm(card.getAttribute('data-year'));
      var cardType = norm(card.getAttribute('data-type'));
      var visible = true;
      if (keyword && text.indexOf(keyword) === -1) {
        visible = false;
      }
      if (year && cardYear !== year) {
        visible = false;
      }
      if (type && cardType !== type) {
        visible = false;
      }
      card.classList.toggle('is-hidden', !visible);
    });
  }

  if (input) {
    input.addEventListener('input', applyFilter);
  }
  if (yearSelect) {
    yearSelect.addEventListener('change', applyFilter);
  }
  if (typeSelect) {
    typeSelect.addEventListener('change', applyFilter);
  }
  if (cards.length) {
    applyFilter();
  }
})();
