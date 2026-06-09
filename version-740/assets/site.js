(function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let current = 0;
        let timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.dataset.heroDot || 0));
                startTimer();
            });
        });

        startTimer();
    }

    const scopes = Array.from(document.querySelectorAll("[data-search-scope]"));

    scopes.forEach(function (scope) {
        const input = scope.querySelector("[data-search-input]");
        const cards = Array.from(scope.querySelectorAll(".movie-card"));
        const filterButtons = Array.from(scope.querySelectorAll("[data-filter]"));
        let activeFilter = "";

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function cardText(card) {
            return normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.genre,
                card.dataset.category,
                card.dataset.tags,
                card.textContent
            ].join(" "));
        }

        function applyFilter() {
            const keyword = normalize(input ? input.value : "");
            cards.forEach(function (card) {
                const text = cardText(card);
                const matchedKeyword = !keyword || text.includes(keyword);
                const matchedFilter = !activeFilter || text.includes(normalize(activeFilter));
                card.classList.toggle("is-hidden", !(matchedKeyword && matchedFilter));
            });
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }

        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.dataset.filter || "";
                filterButtons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                applyFilter();
            });
        });
    });
})();
