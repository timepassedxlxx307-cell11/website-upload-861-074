(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.nav-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slider = document.getElementById('hero-slider');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('.hero-prev');
    var next = slider.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  var searchInput = document.getElementById('site-search');
  var regionSelect = document.getElementById('filter-region');
  var typeSelect = document.getElementById('filter-type');
  var yearSelect = document.getElementById('filter-year');
  var resetButton = document.getElementById('filter-reset');
  var countNode = document.getElementById('filter-count');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = normalize(searchInput ? searchInput.value : '');
    var region = normalize(regionSelect ? regionSelect.value : '');
    var type = normalize(typeSelect ? typeSelect.value : '');
    var year = normalize(yearSelect ? yearSelect.value : '');
    var shown = 0;

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-type'),
        card.textContent
      ].join(' '));

      var matched = true;
      matched = matched && (!query || text.indexOf(query) !== -1);
      matched = matched && (!region || normalize(card.getAttribute('data-region')) === region);
      matched = matched && (!type || normalize(card.getAttribute('data-type')) === type);
      matched = matched && (!year || normalize(card.getAttribute('data-year')) === year);

      card.classList.toggle('is-hidden', !matched);

      if (matched) {
        shown += 1;
      }
    });

    if (countNode) {
      countNode.textContent = shown ? '已显示匹配影片' : '没有匹配的影片';
    }
  }

  if (searchInput || regionSelect || typeSelect || yearSelect) {
    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (node) {
      if (node) {
        node.addEventListener('input', applyFilters);
        node.addEventListener('change', applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }

        if (regionSelect) {
          regionSelect.value = '';
        }

        if (typeSelect) {
          typeSelect.value = '';
        }

        if (yearSelect) {
          yearSelect.value = '';
        }

        applyFilters();
      });
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && searchInput) {
      searchInput.value = q;
    }

    applyFilters();
  }
})();

function createM3u8Player(config) {
  var video = document.getElementById(config.videoId);
  var button = document.getElementById(config.buttonId);
  var cover = document.getElementById(config.coverId);
  var started = false;
  var hls = null;

  if (!video || !button || !config.url) {
    return;
  }

  function markPlaying() {
    if (cover) {
      cover.classList.add('is-playing');
    }
  }

  function playVideo() {
    if (started) {
      video.play();
      markPlaying();
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = config.url;
      video.addEventListener('loadedmetadata', function () {
        video.play();
      }, { once: true });
      video.load();
      markPlaying();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(config.url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
      markPlaying();
      return;
    }

    video.src = config.url;
    video.play();
    markPlaying();
  }

  button.addEventListener('click', playVideo);

  Array.prototype.slice.call(document.querySelectorAll('a[href="#' + config.videoId + '"], .start-watch')).forEach(function (node) {
    node.addEventListener('click', function (event) {
      event.preventDefault();
      video.scrollIntoView({ behavior: 'smooth', block: 'center' });
      playVideo();
    });
  });

  video.addEventListener('play', markPlaying);

  video.addEventListener('click', function () {
    if (!started) {
      playVideo();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
