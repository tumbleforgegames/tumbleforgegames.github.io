/* Tumbleforge Games: page behaviour.
   Builds the games section from js/games.js and wires up the small
   interactions (header, fitted wordmark, scroll reveals). */
(() => {
  'use strict';

  const data = window.TUMBLEFORGE || { games: [] };
  const games = Array.isArray(data.games) ? data.games : [];
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const esc = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const playUrl = (game) => `https://play.google.com/store/apps/details?id=${encodeURIComponent(game.packageId)}`;

  // Play Store images take a size suffix; anything else (a local file) is used as is.
  const sized = (src, size) => (/googleusercontent\.com/.test(src) && !/=[^/]*$/.test(src) ? `${src}=${size}` : src);

  /* Icons --------------------------------------------------------- */
  const ICONS = {
    nodes: '<circle cx="6" cy="17" r="2.6"/><circle cx="12" cy="6.5" r="2.6"/><circle cx="18" cy="17" r="2.6"/><path d="M7.3 14.7 10.7 8.8M13.3 8.8l3.4 5.9"/>',
    shuffle: '<path d="M3 7h3.5c5 0 5.5 10 10.5 10H21M3 17h3.5c1.7 0 2.9-1.1 3.9-2.6M21 7h-4c-1.7 0-2.9 1.1-3.9 2.6"/><path d="m18 4 3 3-3 3M18 14l3 3-3 3"/>',
    peaks: '<path d="M2.5 19 9 7.5l3.8 6.7 2.4-3.700L21.500 19Z"/><circle cx="17.5" cy="5.5" r="1.8"/>',
    star: '<path d="m12 3.5 2.6 5.4 5.9.8-4.300 4.100 1 5.900L12 16.900l-5.200 2.800 1-5.900-4.300-4.100 5.900-.8Z"/>',
    offline: '<path d="M4 4l16 16M8.6 16.300a5 5 0 0 1 6.800 0M5.200 12.700a10 10 0 0 1 4-2.300M18.800 12.700a10 10 0 0 0-3.300-2.100M2 9.200a15 15 0 0 1 4.300-2.900M22 9.200A15 15 0 0 0 10.600 5.100"/><circle cx="12" cy="19.300" r=".9" fill="currentColor"/>',
    save: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="m9.800 12.300 1.700 1.700 3-3.400"/>',
    theme: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 0 0 17Z" fill="currentColor"/>',
    calm: '<path d="M3 9c2.200-2 4.300-2 6.500 0s4.300 2 6.500 0 4.300-2 5 0M3 15c2.200-2 4.300-2 6.500 0s4.300 2 6.500 0 4.300-2 5 0"/>'
  };
  const icon = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.star}</svg>`;
  const ARROW_OUT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';

  /* Games ---------------------------------------------------------- */
  const featureHtml = (feature, index) => `
    <div class="feature reveal" style="--d:${(index * 0.07).toFixed(2)}s">
      <div class="feature-icons">${(feature.icons || []).map((name) => `<span>${icon(name)}</span>`).join('')}</div>
      <h4>${esc(feature.title)}</h4>
      <p>${esc(feature.text)}</p>
    </div>`;

  const gameHtml = (game) => `
    <article class="game" id="${esc(game.id)}">
      <div class="game-card reveal">
        <div class="game-info">
          <div class="game-id">
            <img class="game-icon" src="${esc(sized(game.icon, 's240-rw'))}" alt="${esc(game.name)} app icon" width="84" height="84">
            <div>
              <p class="game-genre">${esc(game.genre)} · Android</p>
              <h3 class="game-name">${esc(game.name)}</h3>
            </div>
          </div>
          <p class="game-tagline">${esc(game.tagline)}</p>
          <p class="game-desc">${esc(game.description)}</p>
          <ul class="chips">${(game.facts || []).map((fact) => `<li>${esc(fact)}</li>`).join('')}</ul>
          <div class="game-actions">
            <a class="btn btn-accent btn-lg" href="${esc(playUrl(game))}" target="_blank" rel="noopener">Get it on Google Play ${ARROW_OUT}</a>
          </div>
        </div>
        <div class="game-shots" tabindex="0" role="group" aria-label="${esc(game.name)} screenshots, scroll sideways for more">
          ${(game.screenshots || [])
            .map((shot) => `<img src="${esc(sized(shot.src, 'h900-rw'))}" alt="${esc(shot.alt)}" width="270" height="480" loading="lazy" draggable="false">`)
            .join('')}
        </div>
      </div>
      ${game.features && game.features.length ? `<div class="feature-grid">${game.features.map(featureHtml).join('')}</div>` : ''}
    </article>`;

  const list = $('#game-list');
  if (list && games.length) {
    list.innerHTML = games.map(gameHtml).join('');

    const count = $('#games-count');
    if (count) count.textContent = `${String(games.length).padStart(2, '0')} ${games.length === 1 ? 'game' : 'games'} live on Google Play`;

    const footerGames = $('#footer-games');
    if (footerGames) {
      footerGames.innerHTML = games
        .map((game) => `<a href="${esc(playUrl(game))}" target="_blank" rel="noopener">${esc(game.name)}</a>`)
        .join('');
    }

    // The first game in the list is the one the header and call-to-action point at.
    $$('[data-play-featured]').forEach((link) => (link.href = playUrl(games[0])));
  }
  if (data.developerUrl) $$('[data-dev-link]').forEach((link) => (link.href = data.developerUrl));

  /* Drag to scroll the screenshot strips with a mouse --------------- */
  $$('.game-shots').forEach((strip) => {
    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    strip.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      dragging = true;
      startX = event.clientX;
      startScroll = strip.scrollLeft;
      strip.setPointerCapture(event.pointerId);
      strip.classList.add('is-dragging');
    });
    strip.addEventListener('pointermove', (event) => {
      if (dragging) strip.scrollLeft = startScroll - (event.clientX - startX);
    });
    const stop = () => {
      dragging = false;
      strip.classList.remove('is-dragging');
    };
    strip.addEventListener('pointerup', stop);
    strip.addEventListener('pointercancel', stop);
  });

  /* Wordmark: scale it so it spans the hero edge to edge ------------ */
  const wordmark = $('.wordmark');
  const fitWordmark = () => {
    if (!wordmark) return;
    const box = wordmark.parentElement;
    const style = getComputedStyle(box);
    const available = box.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    wordmark.style.fontSize = '100px';
    const natural = wordmark.getBoundingClientRect().width;
    if (natural > 0 && available > 0) wordmark.style.fontSize = `${((100 * available) / natural).toFixed(2)}px`;
  };
  fitWordmark();
  if (wordmark && 'ResizeObserver' in window) {
    let lastWidth = 0;
    new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      if (width !== lastWidth) {
        lastWidth = width;
        fitWordmark();
      }
    }).observe(wordmark.parentElement);
  } else {
    window.addEventListener('resize', fitWordmark);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWordmark);

  /* Header ---------------------------------------------------------- */
  const header = $('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Show the small logo once the big wordmark has scrolled away.
    if (wordmark && 'IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => header.classList.toggle('show-brand', !entry.isIntersecting), {
        rootMargin: '-70px 0px 0px 0px'
      }).observe(wordmark);
    } else {
      header.classList.add('show-brand');
    }

    const toggle = $('.menu-toggle', header);
    const setOpen = (open) => {
      header.classList.toggle('nav-open', open);
      if (toggle) {
        toggle.setAttribute('aria-expanded', String(open));
        toggle.textContent = open ? 'Close' : 'Menu';
      }
    };
    if (toggle) toggle.addEventListener('click', () => setOpen(!header.classList.contains('nav-open')));
    $$('.nav a', header).forEach((link) => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });
  }

  /* Scroll reveals -------------------------------------------------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
