(function () {
  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || '').trim();
  const formInput = document.querySelector('.search-page-form input[name="q"]');
  const status = document.getElementById('searchStatus');
  const results = document.getElementById('searchResults');

  if (formInput) {
    formInput.value = query;
  }

  if (!results || !status || !window.MOVIE_SEARCH_DATA) {
    return;
  }

  function createCard(movie) {
    const card = document.createElement('a');
    card.className = 'movie-card';
    card.href = movie.url;
    card.innerHTML = [
      '<div class="card-poster">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<div class="card-shade"></div>',
      '<span class="play-dot">▶</span>',
      '</div>',
      '<div class="card-body">',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + '</p>',
      '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '</div>'
    ].join('');
    return card;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  if (!query) {
    status.textContent = '输入关键词后即可查看匹配影片。';
    return;
  }

  const lowerQuery = query.toLowerCase();
  const matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
    const haystack = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.tags,
      movie.oneLine
    ].join(' ').toLowerCase();
    return haystack.indexOf(lowerQuery) !== -1;
  }).slice(0, 120);

  results.innerHTML = '';

  if (!matched.length) {
    status.textContent = '没有找到匹配影片，可尝试更换片名、地区、年份或类型关键词。';
    return;
  }

  status.textContent = '已为你匹配到相关影片，点击卡片可进入详情页。';
  matched.forEach(function (movie) {
    results.appendChild(createCard(movie));
  });
}());
