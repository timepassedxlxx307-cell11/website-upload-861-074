(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var isOpen = menu.hasAttribute("hidden") === false;
      if (isOpen) {
        menu.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
      } else {
        menu.removeAttribute("hidden");
        button.setAttribute("aria-expanded", "true");
      }
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function matchesCard(card, query, year) {
    var haystack = normalize([
      card.getAttribute("data-title"),
      card.getAttribute("data-tags"),
      card.getAttribute("data-region"),
      card.getAttribute("data-year"),
      card.getAttribute("data-type")
    ].join(" "));
    var yearMatch = !year || card.getAttribute("data-year") === year;
    return yearMatch && (!query || haystack.indexOf(query) !== -1);
  }

  function setupCardFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));
    inputs.forEach(function (input) {
      var selector = input.getAttribute("data-card-filter");
      var cards = Array.prototype.slice.call(document.querySelectorAll(selector));
      input.addEventListener("input", function () {
        var query = normalize(input.value);
        cards.forEach(function (card) {
          card.hidden = !matchesCard(card, query, "");
        });
      });
    });

    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-select-filter='year']"));
    selects.forEach(function (select) {
      var selector = select.getAttribute("data-card-scope");
      var cards = Array.prototype.slice.call(document.querySelectorAll(selector));
      select.addEventListener("change", function () {
        var year = select.value;
        cards.forEach(function (card) {
          card.hidden = !matchesCard(card, "", year);
        });
      });
    });
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function searchCard(movie) {
    return [
      "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-tags=\"" + escapeHtml(movie.tags.join(" ")) + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-type=\"" + escapeHtml(movie.type) + "\">",
      "  <a class=\"movie-poster\" href=\"./" + escapeHtml(movie.file) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
      "    <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "  </a>",
      "  <div class=\"movie-info\">",
      "    <div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
      "    <h3><a href=\"./" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p>" + escapeHtml(movie.description) + "</p>",
      "    <div class=\"tag-row\">" + movie.tags.slice(0, 3).map(function (tag) { return "<span>" + escapeHtml(tag) + "</span>"; }).join("") + "</div>",
      "  </div>",
      "</article>"
    ].join("\n");
  }

  function setupSearchPage() {
    var results = document.getElementById("searchResults");
    var title = document.getElementById("searchTitle");
    var input = document.getElementById("searchInput");
    if (!results || typeof SITE_SEARCH_INDEX === "undefined") {
      return;
    }
    var query = getQuery();
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var normalized = normalize(query);
    var matched = SITE_SEARCH_INDEX.filter(function (movie) {
      var haystack = normalize([movie.title, movie.description, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(" ")].join(" "));
      return haystack.indexOf(normalized) !== -1;
    });
    if (title) {
      title.textContent = "搜索结果：" + query + "（" + matched.length + "）";
    }
    if (!matched.length) {
      results.innerHTML = "<div class=\"story-card\"><h2>暂无匹配内容</h2><p>可以尝试输入更短的片名、地区、年份或类型。</p></div>";
      return;
    }
    results.innerHTML = matched.slice(0, 300).map(searchCard).join("\n");
  }

  onReady(function () {
    setupMenu();
    setupHero();
    setupCardFilters();
    setupSearchPage();
  });
})();

function initMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var overlay = document.getElementById(config.overlayId);
  var hlsInstance = null;
  var loaded = false;

  if (!video || !config.source) {
    return;
  }

  function playVideo() {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  function attachStream() {
    if (loaded) {
      playVideo();
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = config.source;
      playVideo();
      return;
    }
    if (typeof Hls !== "undefined" && Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true });
      hlsInstance.loadSource(config.source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        }
      });
      return;
    }
    video.src = config.source;
    playVideo();
  }

  function start() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    attachStream();
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
}
