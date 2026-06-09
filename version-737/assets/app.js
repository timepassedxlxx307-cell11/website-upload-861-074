(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function setHeroSlide(slider, index) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var thumbs = Array.prototype.slice.call(slider.querySelectorAll('.hero-thumb'));
        if (!slides.length) {
            return;
        }
        var nextIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === nextIndex);
        });
        thumbs.forEach(function (thumb, i) {
            thumb.classList.toggle('is-active', i === nextIndex);
        });
        slider.setAttribute('data-current', String(nextIndex));
    }

    function setupHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = slider.querySelectorAll('.hero-slide');
        var thumbs = slider.querySelectorAll('.hero-thumb');
        var previous = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        thumbs.forEach(function (thumb, index) {
            thumb.addEventListener('click', function () {
                setHeroSlide(slider, index);
            });
        });
        if (previous) {
            previous.addEventListener('click', function () {
                setHeroSlide(slider, Number(slider.getAttribute('data-current') || 0) - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                setHeroSlide(slider, Number(slider.getAttribute('data-current') || 0) + 1);
            });
        }
        window.setInterval(function () {
            if (document.hidden) {
                return;
            }
            setHeroSlide(slider, Number(slider.getAttribute('data-current') || 0) + 1);
        }, 5200);
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupFilter() {
        var input = document.querySelector('[data-page-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
        var empty = document.querySelector('[data-empty-result]');
        if (!input || !cards.length) {
            return;
        }
        var run = function () {
            var keyword = input.value.trim().toLowerCase();
            var shown = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search-text') || '').toLowerCase();
                var ok = !keyword || text.indexOf(keyword) !== -1;
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.style.display = shown ? 'none' : 'block';
            }
        };
        input.addEventListener('input', run);
        run();
    }

    function renderSearch() {
        var mount = document.querySelector('[data-search-results]');
        var input = document.querySelector('[data-search-input]');
        var empty = document.querySelector('[data-empty-result]');
        if (!mount || !input || !window.MOVIE_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;
        var run = function () {
            var keyword = input.value.trim().toLowerCase();
            var pool = window.MOVIE_INDEX;
            var results = keyword
                ? pool.filter(function (item) {
                    return item.search.indexOf(keyword) !== -1;
                }).slice(0, 160)
                : pool.slice(0, 80);
            mount.innerHTML = results.map(function (item) {
                return [
                    '<article class="movie-card">',
                    '<a class="poster-link" href="./' + item.url + '" aria-label="' + item.title + '">',
                    '<img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">',
                    '<span class="poster-shine"></span>',
                    '</a>',
                    '<div class="movie-card-body">',
                    '<div class="movie-meta-line"><span>' + item.region + '</span><span>' + item.year + '</span><span>' + item.type + '</span></div>',
                    '<h3><a href="./' + item.url + '">' + item.title + '</a></h3>',
                    '<p>' + item.oneLine + '</p>',
                    '<div class="tag-row"><span>' + item.genre + '</span></div>',
                    '</div>',
                    '</article>'
                ].join('');
            }).join('');
            if (empty) {
                empty.style.display = results.length ? 'none' : 'block';
            }
        };
        input.addEventListener('input', run);
        run();
    }

    window.initMoviePlayer = function (url) {
        var video = document.querySelector('[data-player-video]');
        var cover = document.querySelector('[data-player-cover]');
        var state = document.querySelector('[data-player-state]');
        var loaded = false;
        var hls = null;
        if (!video || !cover || !url) {
            return;
        }
        function setState(text) {
            if (state) {
                state.textContent = text || '';
            }
        }
        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            setState('加载中...');
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setState('');
                    video.play().catch(function () {});
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setState('暂时无法播放，请稍后再试');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                video.addEventListener('loadedmetadata', function () {
                    setState('');
                    video.play().catch(function () {});
                }, { once: true });
            } else {
                setState('暂时无法播放，请稍后再试');
            }
        }
        function start() {
            cover.hidden = true;
            video.controls = true;
            load();
            video.play().catch(function () {});
        }
        cover.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilter();
        renderSearch();
    });
}());
