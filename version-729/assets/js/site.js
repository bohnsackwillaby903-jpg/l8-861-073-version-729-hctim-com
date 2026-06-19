document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-nav-search]")).forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input");
      var query = input ? input.value.trim() : "";
      var target = "search.html";
      if (query) {
        target += "?q=" + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  });

  var filterForm = document.querySelector("[data-filter-form]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var count = document.querySelector("[data-filter-count]");
  var empty = document.querySelector("[data-empty-state]");

  if (filterForm && cards.length) {
    var queryInput = filterForm.querySelector("[data-filter-query]");
    var regionInput = filterForm.querySelector("[data-filter-region]");
    var yearInput = filterForm.querySelector("[data-filter-year]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (queryInput && initialQuery) {
      queryInput.value = initialQuery;
    }

    function applyFilter() {
      var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
      var region = regionInput ? regionInput.value : "";
      var year = yearInput ? yearInput.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var cardRegion = card.getAttribute("data-region") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "当前显示 " + visible + " 部影片";
      }
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    filterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilter();
    });

    [queryInput, regionInput, yearInput].forEach(function (input) {
      if (input) {
        input.addEventListener("input", applyFilter);
        input.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  }
});
