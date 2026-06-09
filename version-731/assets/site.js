(function () {
  const toggle = document.querySelector("[data-mobile-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  const filterInput = document.querySelector("[data-list-filter]");
  const cards = Array.from(document.querySelectorAll("[data-card]"));
  const emptyState = document.querySelector("[data-empty-state]");
  const clearButton = document.querySelector("[data-search-clear]");
  const chips = Array.from(document.querySelectorAll("[data-filter-chip]"));
  let selectedCategory = "all";

  function paramsQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function filterCards() {
    const keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
    let visible = 0;

    cards.forEach(function (card) {
      const text = card.getAttribute("data-search") || "";
      const category = card.getAttribute("data-category") || "";
      const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      const matchCategory = selectedCategory === "all" || category === selectedCategory;
      const show = matchKeyword && matchCategory;
      card.style.display = show ? "" : "none";

      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  if (filterInput) {
    const query = paramsQuery();

    if (query) {
      filterInput.value = query;
    }

    filterInput.addEventListener("input", filterCards);
    filterCards();
  }

  if (clearButton && filterInput) {
    clearButton.addEventListener("click", function () {
      filterInput.value = "";
      selectedCategory = "all";
      chips.forEach(function (chip) {
        chip.classList.toggle("is-active", chip.getAttribute("data-filter-chip") === "all");
      });
      filterCards();
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      selectedCategory = chip.getAttribute("data-filter-chip") || "all";
      chips.forEach(function (item) {
        item.classList.toggle("is-active", item === chip);
      });
      filterCards();
    });
  });
})();
