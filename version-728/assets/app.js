(function () {
  var headerButton = document.querySelector(".mobile-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (headerButton && mobilePanel) {
    headerButton.addEventListener("click", function () {
      var opened = mobilePanel.classList.toggle("is-open");
      headerButton.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  document.querySelectorAll(".site-search").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      if (!input || input.value.trim() === "") {
        event.preventDefault();
        if (input) {
          input.focus();
        }
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === current);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  var nextButton = document.querySelector(".hero-next");
  var prevButton = document.querySelector(".hero-prev");

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      showSlide(current + 1);
      startHero();
    });
  }

  if (prevButton) {
    prevButton.addEventListener("click", function () {
      showSlide(current - 1);
      startHero();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      startHero();
    });
  });

  startHero();

  var filterGrid = document.querySelector(".filter-grid");

  if (filterGrid) {
    var keyword = document.querySelector(".filter-keyword");
    var region = document.querySelector(".filter-region");
    var year = document.querySelector(".filter-year");
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll(".movie-card"));
    var empty = document.querySelector(".empty-filter");

    function runFilter() {
      var q = keyword ? keyword.value.trim().toLowerCase() : "";
      var r = region ? region.value : "";
      var y = year ? year.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title || "",
          card.dataset.genre || "",
          card.dataset.tags || "",
          card.textContent || ""
        ].join(" ").toLowerCase();
        var ok = true;

        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (r && card.dataset.region !== r) {
          ok = false;
        }
        if (y && card.dataset.year !== y) {
          ok = false;
        }

        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    [keyword, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", runFilter);
        control.addEventListener("change", runFilter);
      }
    });
  }

  function renderSearchPage() {
    var searchResults = document.getElementById("search-results");

    if (!searchResults || typeof SEARCH_DATA === "undefined") {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = (params.get("q") || "").trim();
    var input = document.getElementById("search-page-input");
    var count = document.getElementById("search-count");

    if (input) {
      input.value = q;
    }

    function cardTemplate(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");

      return "<article class=\"movie-card\">" +
        "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
        "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
        "<span class=\"poster-glow\"></span>" +
        "</a>" +
        "<div class=\"movie-card-body\">" +
        "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>" +
        "<h2><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h2>" +
        "<p>" + escapeHtml(movie.one_line) + "</p>" +
        "<div class=\"tag-row\">" + tags + "</div>" +
        "</div>" +
        "</article>";
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>'"]/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          "\"": "&quot;"
        }[char];
      });
    }

    if (q) {
      var lower = q.toLowerCase();
      var matches = SEARCH_DATA.filter(function (movie) {
        return [
          movie.title,
          movie.region,
          movie.year,
          movie.genre,
          movie.one_line,
          (movie.tags || []).join(" ")
        ].join(" ").toLowerCase().indexOf(lower) !== -1;
      }).slice(0, 120);

      searchResults.innerHTML = matches.map(cardTemplate).join("");
      if (count) {
        count.textContent = matches.length ? "找到 " + matches.length + " 条相关影片" : "未找到相关影片";
      }
    } else if (count) {
      count.textContent = "输入关键词开始查找影片";
    }
  }

  setTimeout(renderSearchPage, 0);

  window.bindMoviePlayer = function (videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var ready = false;
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function attach() {
      if (ready) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      ready = true;
    }

    function begin() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", begin);
    }

    video.addEventListener("click", function () {
      if (!ready) {
        begin();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
