const SNIPPET_BEFORE = 20;
const SNIPPET_AFTER = 80;
const LIFE_TAG = 'Life Blog';

listenSearchInput('/search.xml', '#search', '#result');

function parseDateFromUrl(url) {
  const m = url.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
  if (!m) return null;
  return new Date(Date.UTC(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10)));
}

function formatDate(date) {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

function postMeta(post) {
  const isLife = post.tags.some(t => t === LIFE_TAG);
  const category = isLife ? 'Life' : 'Tech';
  const displayTags = post.tags.filter(t => t !== LIFE_TAG);
  const dateText = formatDate(parseDateFromUrl(post.url));

  const parts = [category];
  displayTags.forEach(t => parts.push(t));
  if (dateText) parts.push(dateText);

  return parts
    .map(p => `<span class="search-meta-item">${p}</span>`)
    .join('<span class="search-meta-sep">·</span>');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function listenSearchInput(url, searchId, resultId) {
  const searchEl = $(searchId);
  const resultEl = $(resultId);

  $('#searchModal').on('shown.bs.modal', function () {
    searchEl.focus();
  });

  $('#searchModal').on('hidden.bs.modal', function () {
    searchEl.val('');
    resultEl.html('');
  });

  $.ajax({
    url,
    dataType: "xml",
    success: function (response) {
      const data = $('entry', response).map(function () {
        return {
          title: $('title', this).text(),
          tags: $('tag', this).map(function () {
            return this.innerHTML.trim();
          }).get(),
          content: $('content', this).text().replace(/<[^>]+>/g, ''),
          url: $('url', this).text().trim()
        };
      }).get();

      searchEl.on('input', function () {
        resultEl.html('');

        const keyword = searchEl.val().trim().toLowerCase();
        if (keyword.length <= 1) return;

        let resultHTML = '';

        data.forEach(function (post) {
          const titleLc = post.title.toLowerCase();
          const tagsLc = post.tags.map(t => t.toLowerCase());
          const contentLc = post.content.toLowerCase();

          const isMatch =
            titleLc.indexOf(keyword) >= 0 ||
            contentLc.indexOf(keyword) >= 0 ||
            tagsLc.some(t => t.indexOf(keyword) >= 0);

          if (!isMatch) return;

          const idx = contentLc.indexOf(keyword);
          const start = idx >= SNIPPET_BEFORE ? idx - SNIPPET_BEFORE : 0;
          const end = idx + SNIPPET_AFTER <= contentLc.length ? idx + SNIPPET_AFTER : contentLc.length;
          const matchContent = post.content.slice(start, end) + (end < contentLc.length ? '...' : '');
          const reg = new RegExp(escapeRegex(keyword), 'gi');
          const mContent = matchContent.replace(reg, `<span class="keyword">${keyword}</span>`);

          resultHTML += `
            <li class="list-group-item search-result-item">
              <a class="search-result-link" href="${post.url}">
                <div class="title">${post.title}</div>
                <div class="search-meta">${postMeta(post)}</div>
                <div class="content">${mContent}</div>
              </a>
            </li>
          `;
        });

        resultEl.html(resultHTML);
      });
    }
  });
}
