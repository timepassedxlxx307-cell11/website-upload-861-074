(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileNav() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input");
                var value = input ? input.value.trim() : "";
                var target = "search.html";
                if (value) {
                    target += "?q=" + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
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
        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var panels = document.querySelectorAll("[data-filter-panel]");
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var select = panel.querySelector("[data-filter-select]");
            var scope = document.querySelector(panel.getAttribute("data-filter-target") || "body");
            var empty = document.querySelector(panel.getAttribute("data-empty-target") || "");
            if (!scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";
            if (input && initial) {
                input.value = initial;
            }

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var type = select ? select.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-genre") || "",
                        card.getAttribute("data-tags") || "",
                        card.getAttribute("data-type") || ""
                    ].join(" ").toLowerCase();
                    var typeOk = !type || text.indexOf(type.toLowerCase()) !== -1;
                    var wordOk = !keyword || text.indexOf(keyword) !== -1;
                    var showCard = typeOk && wordOk;
                    card.style.display = showCard ? "" : "none";
                    if (showCard) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (select) {
                select.addEventListener("change", apply);
            }
            apply();
        });
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var trigger = player.querySelector(".play-cover");
            var stream = player.getAttribute("data-stream");
            var loaded = false;
            if (!video || !stream) {
                return;
            }

            function bindStream() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    video.hlsInstance = hls;
                } else {
                    video.src = stream;
                }
            }

            function playVideo() {
                bindStream();
                if (trigger) {
                    trigger.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        if (trigger) {
                            trigger.classList.remove("is-hidden");
                        }
                    });
                }
            }

            if (trigger) {
                trigger.addEventListener("click", playVideo);
            }
            video.addEventListener("click", function () {
                if (!loaded) {
                    playVideo();
                }
            });
        });
    }

    ready(function () {
        initMobileNav();
        initSearchForms();
        initHero();
        initFilters();
        initPlayers();
    });
})();
