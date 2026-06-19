(function () {
    function closestForm(element) {
        return element ? element.closest("[data-search-form]") : null;
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupMenu() {
        const toggle = document.querySelector("[data-menu-toggle]");
        const panel = document.querySelector("[data-mobile-panel]");

        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        const root = document.querySelector("[data-hero]");

        if (!root) {
            return;
        }

        const slides = Array.from(root.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(root.querySelectorAll("[data-hero-dot]"));
        const previous = root.querySelector("[data-hero-prev]");
        const next = root.querySelector("[data-hero-next]");
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === index);
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

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
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

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function resultTemplate(item) {
        return [
            "<a class=\"search-result-item\" href=\"" + item.file + "\">",
            "<img src=\"" + item.image + "\" alt=\"" + item.title.replace(/\"/g, "&quot;") + "\">",
            "<span>",
            "<strong>" + item.title + "</strong>",
            "<em>" + item.year + " · " + item.region + " · " + item.genre + "</em>",
            "</span>",
            "</a>"
        ].join("");
    }

    function setupSearchForms() {
        const forms = Array.from(document.querySelectorAll("[data-search-form]"));
        const data = Array.isArray(window.SEARCH_MOVIES) ? window.SEARCH_MOVIES : [];

        forms.forEach(function (form) {
            const input = form.querySelector("[data-search-input]");
            const results = form.querySelector("[data-search-results]");

            if (!input || !results) {
                return;
            }

            function render() {
                const query = normalize(input.value);

                if (!query) {
                    results.classList.remove("is-visible");
                    results.innerHTML = "";
                    return;
                }

                const matches = data.filter(function (item) {
                    return normalize(item.title + " " + item.year + " " + item.region + " " + item.genre + " " + item.tags).includes(query);
                }).slice(0, 8);

                results.innerHTML = matches.map(resultTemplate).join("");
                results.classList.toggle("is-visible", matches.length > 0);
            }

            input.addEventListener("input", render);
            input.addEventListener("focus", render);

            form.addEventListener("submit", function (event) {
                event.preventDefault();
                const first = results.querySelector("a");

                if (first) {
                    window.location.href = first.href;
                }
            });

            document.addEventListener("click", function (event) {
                if (closestForm(event.target) !== form) {
                    results.classList.remove("is-visible");
                }
            });
        });
    }

    function setupCatalogFilters() {
        const grids = Array.from(document.querySelectorAll("[data-catalog-grid]"));

        grids.forEach(function (grid) {
            const cards = Array.from(grid.querySelectorAll(".movie-card"));
            const search = document.querySelector("[data-catalog-search]");
            const yearSelect = document.querySelector("[data-catalog-year]");
            const typeSelect = document.querySelector("[data-catalog-type]");
            const years = Array.from(new Set(cards.map(function (card) {
                return card.getAttribute("data-year") || "";
            }).filter(Boolean))).sort().reverse();
            const types = Array.from(new Set(cards.map(function (card) {
                return card.getAttribute("data-type") || "";
            }).filter(Boolean))).sort();

            if (yearSelect && yearSelect.options.length === 1) {
                years.forEach(function (year) {
                    const option = document.createElement("option");
                    option.value = year;
                    option.textContent = year;
                    yearSelect.appendChild(option);
                });
            }

            if (typeSelect && typeSelect.options.length === 1) {
                types.forEach(function (type) {
                    const option = document.createElement("option");
                    option.value = type;
                    option.textContent = type;
                    typeSelect.appendChild(option);
                });
            }

            function apply() {
                const query = normalize(search ? search.value : "");
                const year = yearSelect ? yearSelect.value : "";
                const type = typeSelect ? typeSelect.value : "";

                cards.forEach(function (card) {
                    const haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    const matchesText = !query || haystack.includes(query);
                    const matchesYear = !year || card.getAttribute("data-year") === year;
                    const matchesType = !type || card.getAttribute("data-type") === type;
                    card.classList.toggle("is-hidden", !(matchesText && matchesYear && matchesType));
                });
            }

            [search, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupSearchForms();
        setupCatalogFilters();
    });
}());
