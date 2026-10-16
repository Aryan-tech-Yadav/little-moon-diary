(() => {
  'use strict';
  const postsRoot = document.querySelector('#posts');
  const filtersRoot = document.querySelector('#filters');
  const searchInput = document.querySelector('#search');
  const emptyState = document.querySelector('#empty-state');
  const detail = document.querySelector('#post-detail');
  const article = document.querySelector('#article-content');
  const backButton = document.querySelector('#back-to-posts');
  const diaryTitle = document.querySelector('#diary-title');
  const toast = document.querySelector('#toast');
  let allPosts = [];
  let activeCategory = 'All';
  let toastTimer;

  const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const formatDate = value => {
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };
  const readTime = text => `${Math.max(1, Math.ceil(String(text || '').trim().split(/\s+/).filter(Boolean).length / 200))} min read`;
  const showToast = message => {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  };
  const currentSlug = () => new URLSearchParams(window.location.search).get('post');

  async function loadPosts() {
    try {
      const response = await fetch('posts/index.json');
      if (!response.ok) throw new Error(`Could not load posts (${response.status})`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Post index should be a JSON array');
      allPosts = data.filter(post => post && post.slug && post.title && post.file);
      renderFilters();
      renderPosts();
      const slug = currentSlug();
      if (slug) await openPost(slug, false);
    } catch (error) {
      postsRoot.innerHTML = '<div class="loading-card">The diary pages could not load. If you opened this as a file, run a local web server — see README.md.</div>';
      console.error(error);
    }
  }

  function renderFilters() {
    const categories = ['All', ...new Set(allPosts.map(post => post.category).filter(Boolean))];
    filtersRoot.innerHTML = categories.map(category => `<button class="filter${category === activeCategory ? ' active' : ''}" data-category="${escapeHTML(category)}">${category === 'All' ? 'All entries' : escapeHTML(category)}</button>`).join('');
    filtersRoot.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      activeCategory = button.dataset.category;
      filtersRoot.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
      renderPosts();
    }));
  }

  function renderPosts() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = allPosts.filter(post => {
      const categoryMatches = activeCategory === 'All' || post.category === activeCategory;
      const text = `${post.title} ${post.excerpt || ''} ${post.category || ''} ${post.date || ''}`.toLowerCase();
      return categoryMatches && text.includes(query);
    }).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    postsRoot.hidden = false;
    detail.hidden = true;
    emptyState.hidden = filtered.length !== 0;
    postsRoot.innerHTML = filtered.length ? filtered.map(post => `
      <a class="post-card" href="?post=${encodeURIComponent(post.slug)}#diary" data-slug="${escapeHTML(post.slug)}">
        <div class="post-meta"><span>${escapeHTML(formatDate(post.date))}</span><span class="post-category">${escapeHTML(post.category || 'Notes')}</span></div>
        <h3>${escapeHTML(post.title)}</h3><p class="post-excerpt">${escapeHTML(post.excerpt || '')}</p>
        <div class="post-bottom"><span>${escapeHTML(post.readingTime || 'A little read')}</span><span class="post-arrow" aria-hidden="true">↗</span></div>
      </a>`).join('') : '';
    postsRoot.querySelectorAll('[data-slug]').forEach(card => card.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openPost(card.dataset.slug, true);
    }));
  }

  async function openPost(slug, updateHistory = true) {
    const post = allPosts.find(item => item.slug === slug);
    if (!post) {
      showToast('That page is still somewhere in the stars.');
      return;
    }
    try {
      const response = await fetch(post.file);
      if (!response.ok) throw new Error(`Could not load ${post.file}`);
      const markdown = await response.text();
      const rendered = window.marked && typeof window.marked.parse === 'function'
        ? window.marked.parse(markdown, { gfm: true, breaks: false })
        : `<pre>${escapeHTML(markdown)}</pre>`;
      article.innerHTML = `<header class="article-header"><div class="post-meta"><span>${escapeHTML(formatDate(post.date))}</span><span class="post-category">${escapeHTML(post.category || 'Notes')}</span></div><h1>${escapeHTML(post.title)}</h1><p class="article-excerpt">${escapeHTML(post.excerpt || '')}</p><span class="post-meta">${escapeHTML(post.readingTime || readTime(markdown))}</span></header><div class="markdown-body">${rendered}</div>`;
      postsRoot.hidden = true;
      emptyState.hidden = true;
      detail.hidden = false;
      diaryTitle.innerHTML = 'A page from my <span>diary.</span>';
      if (updateHistory) history.pushState({ slug }, '', `?post=${encodeURIComponent(slug)}#diary`);
      document.querySelector('#diary').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      console.error(error);
      showToast('Could not open that page. Please try again.');
    }
  }

  function showAllPosts(updateHistory = true) {
    detail.hidden = true;
    postsRoot.hidden = false;
    diaryTitle.innerHTML = 'From my <span>diary.</span>';
    renderPosts();
    if (updateHistory) history.pushState({}, '', `${window.location.pathname}#diary`);
  }

  searchInput.addEventListener('input', renderPosts);
  backButton.addEventListener('click', () => showAllPosts(true));
  window.addEventListener('popstate', async () => {
    const slug = currentSlug();
    if (slug) await openPost(slug, false);
    else showAllPosts(false);
  });
  document.querySelectorAll('a[href="#diary"]').forEach(link => link.addEventListener('click', () => {
    if (currentSlug()) history.pushState({}, '', `${window.location.pathname}#diary`);
    showAllPosts(false);
  }));
  document.querySelector('#contact-link').addEventListener('click', event => {
    if (event.currentTarget.getAttribute('href') === 'mailto:hello@example.com') {
      event.preventDefault();
      showToast('Update hello@example.com in index.html with your email.');
    }
  });

  // Small pointer response for the ghost; it remains usable without a mouse.
  const ghost = document.querySelector('#ghost');
  const art = document.querySelector('.hero-art');
  if (ghost && art && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    art.addEventListener('pointermove', event => {
      const rect = art.getBoundingClientRect();
      const dx = (event.clientX - rect.left - rect.width / 2) / rect.width;
      const dy = (event.clientY - rect.top - rect.height / 2) / rect.height;
      ghost.style.translate = `${dx * 12}px ${dy * 8}px`;
    });
    art.addEventListener('pointerleave', () => { ghost.style.translate = ''; });
  }

  // Baby ghost companion: a tiny friendly interaction, with no external assets.
  const buddy = document.querySelector('#baby-buddy');
  const buddyBubble = document.querySelector('#buddy-bubble');
  if (buddy && buddyBubble) {
    const buddyLines = [
      'you are doing great ♡',
      'one little step at a time ✨',
      'remember to take a cozy break ☕',
      'your thoughts belong here 🌙',
      'tiny progress is still progress!'
    ];
    let buddyIndex = 0;
    buddy.addEventListener('click', () => {
      buddyBubble.textContent = buddyLines[buddyIndex % buddyLines.length];
      buddyIndex += 1;

      buddy.classList.remove('is-talking');
      void buddy.offsetWidth;
      buddy.classList.add('is-talking');

      // Create a few tiny floating hearts around the ghost.
      const symbols = ['♡', '✦', '♥', '✧', '♡'];

      symbols.forEach((symbol, index) => {
        const particle = document.createElement('span');
        particle.className = 'buddy-heart';
        particle.textContent = symbol;
        particle.setAttribute('aria-hidden', 'true');
        particle.style.setProperty('--heart-x', `${(index - 2) * 19}px`);
        particle.style.setProperty('--heart-delay', `${index * 90}ms`);
        buddy.appendChild(particle);

        window.setTimeout(() => particle.remove(), 1500);
      });

      window.clearTimeout(buddy._bubbleTimer);
      buddy._bubbleTimer = window.setTimeout(
        () => buddy.classList.remove('is-talking'),
        2600
      );
    });
  }

  loadPosts();
})();
