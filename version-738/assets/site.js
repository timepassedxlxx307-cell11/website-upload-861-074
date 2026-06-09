function qs(selector, root) {
    return (root || document).querySelector(selector);
}

function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
}

document.addEventListener("DOMContentLoaded", function () {
    var toggle = qs("[data-mobile-toggle]");
    var panel = qs("[data-mobile-panel]");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    var hero = qs("[data-hero]");

    if (hero) {
        var slides = qsa("[data-hero-slide]", hero);
        var dots = qsa("[data-hero-dot]", hero);
        var next = qs("[data-hero-next]", hero);
        var prev = qs("[data-hero-prev]", hero);
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        function resetTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            startTimer();
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                resetTimer();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                resetTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                resetTimer();
            });
        });

        startTimer();
    }

    var filterList = qs("[data-filter-list]");

    if (filterList) {
        var cards = qsa("[data-filter-card]", filterList);
        var input = qs("[data-filter-input]");
        var selects = qsa("[data-filter-select]");
        var empty = qs("[data-no-result]");

        function runFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var visible = 0;
            var selected = {};

            selects.forEach(function (select) {
                selected[select.getAttribute("data-filter-select")] = select.value.trim().toLowerCase();
            });

            cards.forEach(function (card) {
                var content = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();

                var matched = true;

                if (keyword && content.indexOf(keyword) === -1) {
                    matched = false;
                }

                Object.keys(selected).forEach(function (key) {
                    if (!selected[key]) {
                        return;
                    }

                    var value = (card.getAttribute("data-" + key) || "").toLowerCase();

                    if (value.indexOf(selected[key]) === -1) {
                        matched = false;
                    }
                });

                card.style.display = matched ? "" : "none";

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", runFilter);
        }

        selects.forEach(function (select) {
            select.addEventListener("change", runFilter);
        });
    }

    initSearchPage();
});

function initSearchPage() {
    var form = qs("[data-search-form]");
    var results = qs("[data-search-results]");
    var empty = qs("[data-search-empty]");

    if (!form || !results || !window.SEARCH_MOVIES) {
        return;
    }

    var input = qs("[data-search-input]", form);
    var region = qs("[data-search-region]", form);
    var type = qs("[data-search-type]", form);
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (input) {
        input.value = query;
    }

    function buildCard(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return "" +
            "<article class=\"movie-card compact-card\">" +
            "<a class=\"poster-wrap\" href=\"./" + escapeHtml(movie.file) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"play-dot\">▶</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<h2><a href=\"./" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h2>" +
            "<p class=\"meta-line\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.year) + " · " + escapeHtml(movie.type) + "</p>" +
            "<p class=\"card-desc\">" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function render() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value.trim().toLowerCase() : "";
        var typeValue = type ? type.value.trim().toLowerCase() : "";

        if (!keyword && !regionValue && !typeValue) {
            results.innerHTML = "";
            if (empty) {
                empty.textContent = "输入关键词后显示结果";
                empty.classList.add("show");
            }
            return;
        }

        var list = window.SEARCH_MOVIES.filter(function (movie) {
            var content = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.tags.join(" "),
                movie.oneLine
            ].join(" ").toLowerCase();

            if (keyword && content.indexOf(keyword) === -1) {
                return false;
            }

            if (regionValue && movie.region.toLowerCase().indexOf(regionValue) === -1) {
                return false;
            }

            if (typeValue && movie.type.toLowerCase().indexOf(typeValue) === -1) {
                return false;
            }

            return true;
        }).slice(0, 96);

        results.innerHTML = list.map(buildCard).join("");

        if (empty) {
            empty.textContent = "没有匹配的影片";
            empty.classList.toggle("show", list.length === 0);
        }
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        render();
    });

    [input, region, type].forEach(function (element) {
        if (element) {
            element.addEventListener("input", render);
            element.addEventListener("change", render);
        }
    });

    render();
}

function initMoviePlayer(videoId, sourceUrl) {
    var video = document.getElementById(videoId);

    if (!video || !sourceUrl) {
        return;
    }

    var shell = video.closest(".player-shell");
    var button = document.querySelector("[data-player-button='" + videoId + "']");
    var loaded = false;
    var hlsInstance = null;

    function loadSource() {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                maxBufferLength: 60,
                backBufferLength: 30
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = sourceUrl;
    }

    function playVideo() {
        loadSource();

        if (shell) {
            shell.classList.add("is-playing");
        }

        var attempt = video.play();

        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener("play", function () {
        if (shell) {
            shell.classList.add("is-playing");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
