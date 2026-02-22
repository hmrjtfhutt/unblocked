// Adds banner behavior to non-index pages. Include this script at the end of each game page.
(function(){
  function qs(sel){return document.querySelector(sel)}
  const root = document.documentElement;

  // Only inject banner on non-index pages (e.g. /games/*). Detect index by pathname.
  const isIndex = /(^|\/)index\.html$/.test(location.pathname) || location.pathname === '/' || location.pathname === '';
  if(isIndex) return;

  // If a banner doesn't exist in the page, inject one and mark page as game-page
  let banner = qs('.page-banner');
  if(!banner){
    banner = document.createElement('div');
    banner.className = 'page-banner';
    const titleText = document.title || 'Game';
    banner.innerHTML = `\n      <div class="title">${titleText}</div>\n      <div class="controls">\n        <button id="backBtn" class="banner-btn">Back</button>\n        <button id="fsBtn" class="banner-btn">Fullscreen</button>\n      </div>\n    `;
    document.body.insertBefore(banner, document.body.firstChild);
  }

  // Mark page so CSS can scope banner styles
  root.classList.add('game-page');

  const backBtn = qs('#backBtn');
  const fsBtn = qs('#fsBtn');

  // Back button: go to index.html (resolves against <base> if present)
  backBtn?.addEventListener('click', () => { location.href = 'index.html'; });

  fsBtn?.addEventListener('click', async () => {
    if(!document.fullscreenElement){
      try{ await document.documentElement.requestFullscreen(); }catch(e){ console.warn(e) }
    } else {
      try{ await document.exitFullscreen(); }catch(e){ console.warn(e) }
    }
  });

  // When entering fullscreen, hide banner via class on root; remove when exiting
  document.addEventListener('fullscreenchange', () => {
    if(document.fullscreenElement){ root.classList.add('fullscreen-hide'); }
    else { root.classList.remove('fullscreen-hide'); }
  });
})();
