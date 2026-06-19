(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-button]');
        var menu = document.querySelector('[data-mobile-nav]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (slides.length === 0) {
            return;
        }
        var current = 0;
        function activate(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activate(index);
            });
        });
        window.setInterval(function () {
            activate((current + 1) % slides.length);
        }, 5200);
    }

    function setupFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
        inputs.forEach(function (input) {
            var items = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
            var empty = document.querySelector('[data-filter-empty]');
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query && input.name === 'q') {
                input.value = query;
            }
            function applyFilter() {
                var value = input.value.trim().toLowerCase();
                var visible = 0;
                items.forEach(function (item) {
                    var text = [
                        item.getAttribute('data-title') || '',
                        item.getAttribute('data-tags') || '',
                        item.getAttribute('data-region') || '',
                        item.getAttribute('data-year') || '',
                        item.textContent || ''
                    ].join(' ').toLowerCase();
                    var match = !value || text.indexOf(value) !== -1;
                    item.style.display = match ? '' : 'none';
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible === 0 ? 'block' : 'none';
                }
            }
            input.addEventListener('input', applyFilter);
            applyFilter();
        });
    }

    function attachVideo(video, source) {
        if (!video || !source || video.dataset.ready === '1') {
            return;
        }
        video.dataset.ready = '1';
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hls = hls;
            return;
        }
        video.src = source;
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('[data-play-button]');
            var source = shell.getAttribute('data-src');
            function start(event) {
                if (event) {
                    event.preventDefault();
                }
                attachVideo(video, source);
                shell.classList.add('is-playing');
                video.setAttribute('controls', 'controls');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            }
            if (button) {
                button.addEventListener('click', start);
            }
            shell.addEventListener('click', function (event) {
                if (event.target === video) {
                    return;
                }
                start(event);
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
