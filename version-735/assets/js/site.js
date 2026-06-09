(function () {
  const menuButton = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const opened = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  const slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    const dots = slider.querySelector('[data-hero-dots]');
    let current = 0;
    let timer = null;

    function drawDots() {
      if (!dots) {
        return;
      }
      dots.innerHTML = '';
      slides.forEach(function (_, index) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换到第' + (index + 1) + '个推荐');
        dot.addEventListener('click', function () {
          show(index);
          restart();
        });
        dots.appendChild(dot);
      });
    }

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      if (dots) {
        Array.from(dots.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    drawDots();
    show(0);
    restart();

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
  }

  const filterInput = document.querySelector('.filter-input');
  const filterSelect = document.querySelector('.filter-select');
  const filterScope = document.querySelector('.filter-scope');

  if (filterScope && (filterInput || filterSelect)) {
    const cards = Array.from(filterScope.querySelectorAll('.movie-card'));

    function applyFilter() {
      const keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
      const year = filterSelect ? filterSelect.value : '';

      cards.forEach(function (card) {
        const haystack = ((card.dataset.title || '') + ' ' + (card.dataset.keywords || '')).toLowerCase();
        const yearValue = card.dataset.year || '';
        const keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
        const yearMatched = !year || yearValue === year;
        card.style.display = keywordMatched && yearMatched ? '' : 'none';
      });
    }

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }

    if (filterSelect) {
      filterSelect.addEventListener('change', applyFilter);
    }
  }
}());
