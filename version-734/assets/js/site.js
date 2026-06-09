(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupGlobalSearch() {
    qsa('[data-global-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var target = form.getAttribute('data-target') || 'library.html';
        var query = input ? input.value.trim() : '';
        window.location.href = query ? target + '?q=' + encodeURIComponent(query) : target;
      });
    });
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-category'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' '));
  }

  function setupCardFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var input = qs('[data-card-search]', scope);
      var clear = qs('[data-clear-filter]', scope);
      var list = scope.nextElementSibling;
      while (list && !list.hasAttribute('data-card-list')) {
        list = list.nextElementSibling;
      }
      if (!input || !list) {
        return;
      }
      var cards = qsa('[data-movie-card]', list);
      var apply = function (value) {
        var term = normalize(value);
        cards.forEach(function (card) {
          card.style.display = !term || cardText(card).indexOf(term) !== -1 ? '' : 'none';
        });
      };
      input.addEventListener('input', function () {
        apply(input.value);
      });
      if (clear) {
        clear.addEventListener('click', function () {
          input.value = '';
          apply('');
          input.focus();
        });
      }
      qsa('[data-filter-chip]', scope).forEach(function (chip) {
        chip.addEventListener('click', function () {
          input.value = chip.getAttribute('data-filter-chip') || chip.textContent;
          apply(input.value);
        });
      });
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        input.value = query;
        apply(query);
      }
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === current);
      });
    };
    var start = function () {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };
    var stop = function () {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        stop();
        show(index);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (shell) {
      var video = qs('video', shell);
      var cover = qs('.player-cover', shell);
      if (!video || !cover) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var loaded = false;
      var hlsInstance = null;
      var load = function () {
        if (loaded || !stream) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        loaded = true;
      };
      var play = function () {
        load();
        cover.classList.add('is-hidden');
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      };
      cover.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('error', function () {
        if (hlsInstance && hlsInstance.destroy) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupGlobalSearch();
    setupCardFilters();
    setupHero();
    setupPlayers();
  });
})();
