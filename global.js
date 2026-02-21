// Adds banner behavior to non-index pages. Include this script at the end of each game page.
(function(){
  function qs(sel){return document.querySelector(sel)}
  const root = document.documentElement;

  // If a banner doesn't exist in the page, inject a global banner at top
  let banner = qs('.page-banner');
  if(!banner){
    banner = document.createElement('div');
    banner.className = 'page-banner';
    const titleText = document.title || 'Game';
    banner.innerHTML = `
      <div class="title">${titleText}</div>
      <div class="controls">
        <button id="backBtn" class="banner-btn">Back</button>
        <button id="fsBtn" class="banner-btn">Fullscreen</button>
      </div>
    `;
    document.body.insertBefore(banner, document.body.firstChild);
  }

  const backBtn = qs('#backBtn');
  const fsBtn = qs('#fsBtn');

  // Back button: navigate to index. Handles pages inside /games/ and root pages.
  backBtn?.addEventListener('click', () => {
    if(location.pathname.includes('/games/')){
      location.href = '../index.html';
    } else {
      location.href = 'index.html';
    }
  });

  fsBtn?.addEventListener('click', async () => {
    if(!document.fullscreenElement){
      try{ await document.documentElement.requestFullscreen(); }catch(e){ console.warn(e) }
    } else {
      try{ await document.exitFullscreen(); }catch(e){ console.warn(e) }
    }
  });

  // When entering fullscreen, hide banner via class on root; remove when exiting
  document.addEventListener('fullscreenchange', () => {
    if(document.fullscreenElement){
      root.classList.add('fullscreen-hide');
    } else {
      root.classList.remove('fullscreen-hide');
    }
  });
})();
