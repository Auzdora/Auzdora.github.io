(function () {
  const grid = document.getElementById('snapshots-grid');
  if (!grid) return;

  const tabsEl = document.getElementById('snapshots-tabs');
  const sentinel = document.getElementById('snapshots-sentinel');
  const emptyEl = document.getElementById('snapshots-empty');

  const modalEl = document.getElementById('snapshotModal');
  const modalImg = document.getElementById('snapshotModalImg');
  const modalCategory = document.getElementById('snapshotModalCategory');
  const modalMeta = document.getElementById('snapshotModalMeta');
  const modalDescription = document.getElementById('snapshotModalDescription');
  const modal = modalEl && window.bootstrap ? new window.bootstrap.Modal(modalEl) : null;

  const PER_PAGE = 12;
  const state = {
    photos: [],
    category: 'all',
    filtered: [],
    rendered: 0,
    loading: false
  };

  fetch('/snapshots/photos.json', { cache: 'no-cache' })
    .then(r => r.ok ? r.json() : [])
    .then(init)
    .catch(() => init([]));

  function init(photos) {
    state.photos = Array.isArray(photos) ? photos : [];
    renderTabs();
    applyFilter('all');
    observeSentinel();
  }

  function renderTabs() {
    const cats = Array.from(new Set(state.photos.map(p => p.category))).sort();
    const existing = tabsEl.querySelectorAll('.snapshots-tab:not([data-category="all"])');
    existing.forEach(el => el.remove());
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'snapshots-tab';
      btn.dataset.category = cat;
      btn.textContent = cat;
      tabsEl.appendChild(btn);
    });
    tabsEl.addEventListener('click', onTabClick);
  }

  function onTabClick(e) {
    const btn = e.target.closest('.snapshots-tab');
    if (!btn) return;
    const cat = btn.dataset.category;
    if (cat === state.category) return;
    tabsEl.querySelectorAll('.snapshots-tab').forEach(el => el.classList.toggle('is-active', el === btn));
    applyFilter(cat);
  }

  function applyFilter(category) {
    state.category = category;
    state.filtered = category === 'all'
      ? state.photos.slice()
      : state.photos.filter(p => p.category === category);
    state.rendered = 0;
    grid.innerHTML = '';
    if (state.filtered.length === 0) {
      emptyEl.hidden = false;
    } else {
      emptyEl.hidden = true;
      renderNextBatch();
    }
  }

  function renderNextBatch() {
    if (state.loading) return;
    if (state.rendered >= state.filtered.length) return;
    state.loading = true;
    const batch = state.filtered.slice(state.rendered, state.rendered + PER_PAGE);
    const frag = document.createDocumentFragment();
    const cards = [];
    batch.forEach(photo => {
      const card = createCard(photo);
      frag.appendChild(card);
      cards.push(card);
    });
    grid.appendChild(frag);
    state.rendered += batch.length;
    requestAnimationFrame(() => {
      cards.forEach((card, i) => {
        setTimeout(() => card.classList.add('is-visible'), i * 30);
      });
      state.loading = false;
    });
  }

  function createCard(photo) {
    const card = document.createElement('figure');
    card.className = 'snapshot-card';
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = photo.url;
    img.alt = photo.file;
    if (photo.width && photo.height) {
      img.width = photo.width;
      img.height = photo.height;
    }
    card.appendChild(img);
    card.addEventListener('click', () => openModal(photo));
    return card;
  }

  function openModal(photo) {
    if (!modal) return;
    modalImg.src = photo.url;
    modalImg.alt = photo.file;
    modalCategory.textContent = photo.category || '';
    modalMeta.innerHTML = '';
    const items = [
      ['Date', photo.exif && photo.exif.date],
      ['Camera', photo.exif && photo.exif.camera],
      ['Lens', photo.exif && photo.exif.lens],
      ['Aperture', photo.exif && photo.exif.aperture],
      ['ISO', photo.exif && photo.exif.iso],
      ['Shutter', photo.exif && photo.exif.shutter],
      ['Focal', photo.exif && photo.exif.focal]
    ];
    items.forEach(([label, value]) => {
      if (!value) return;
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      modalMeta.appendChild(dt);
      modalMeta.appendChild(dd);
    });
    modalDescription.textContent = photo.description || '';
    modal.show();
  }

  function observeSentinel() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: render all
      while (state.rendered < state.filtered.length) renderNextBatch();
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) renderNextBatch();
      });
    }, { rootMargin: '300px 0px' });
    io.observe(sentinel);
  }
})();
