(function(){
  const cdn = 'https://cdn.jsdelivr.net/gh/hmrjtfhutt/unblocked@main/';
  const games = [
    {title:'Request a Game',img:'https://via.placeholder.com/300x180.png?text=Request',page:'https://docs.google.com/forms/d/e/1FAIpQLSfD-example-form/viewform'},
    {title:'Snow Rider 3D',img:'https://play-lh.googleusercontent.com/5qSxhoGrmuli1qu2qmF4Z8h2ecUitGs0iPXhPd2YD_3iptg8z9boQ8qI1fgTA8WusQ=w526-h296-rw',page:'games/SnowRider3D.html'},
    {title:'Clover Pit',img:'none.png',page:'games/clover.html'}
  ];

  const listView = document.getElementById('listView');
  const gamesContainer = document.getElementById('gamesContainer');
  const searchBar = document.getElementById('searchBar');
  const gameView = document.getElementById('gameView');

  // track injected assets and created blob urls so we can clean them up
  const createdBlobUrls = new Set();

  function makeAbsolute(attr){
    if(!attr) return attr;
    if(/^[a-z]+:\/\//i.test(attr)) return attr; // already absolute
    return cdn + (attr.startsWith('/')? attr.slice(1): attr);
  }

  function render(){
    gamesContainer.innerHTML = '';
    const q = (searchBar.value||'').trim().toLowerCase();
    games.forEach(g=>{
      if(q && !g.title.toLowerCase().includes(q)) return;
      const a = document.createElement('a');
      a.href = '#';
      a.className = 'card';
      a.dataset.page = g.page;
      a.innerHTML = `<img src="${g.img}" alt="${g.title}"><div>${g.title}</div>`;
      a.addEventListener('click', onClickGame);
      gamesContainer.appendChild(a);
    });
  }

  function clearInjected(){
    // remove any previously injected stylesheet/script tags and iframes we added
    document.querySelectorAll('[data-injected]').forEach(n=>n.remove());
    // revoke any blob urls we created
    createdBlobUrls.forEach(u=>{try{URL.revokeObjectURL(u);}catch(e){} });
    createdBlobUrls.clear();
    // if fullscreen, exit it
    try{ if(document.fullscreenElement) document.exitFullscreen(); }catch(e){}
    // clear game view fully
    gameView.innerHTML = '';
    // restore scroll
    try{ document.body.style.overflow = ''; window.scrollTo(0,0); }catch(e){}
  }

  async function onClickGame(e){
    e.preventDefault();
    const page = e.currentTarget.dataset.page;
    let url = page;
    const originalWasAbsolute = /^https?:\/\//i.test(page);
    if(!originalWasAbsolute) url = makeAbsolute(page);

    // If the user provided an absolute external URL (not our CDN), open it directly
    if(originalWasAbsolute && !/cdn.jsdelivr.net\/gh\/hmrjtfhutt\/unblocked/i.test(url)){
      window.open(url,'_blank','noopener');
      return;
    }

    try{
      // Try primary URL (often CDN). If it 404s and the original page was relative,
      // try a local fallback resolved against the current site so local games work.
      let res = await fetch(url,{cache:'no-store'});
      if(!res.ok && !originalWasAbsolute){
        // attempt local fallback
        const localUrl = new URL(page, window.location.href).href;
        try{
          const fres = await fetch(localUrl,{cache:'no-store'});
          if(fres.ok){ res = fres; url = localUrl; }
          else throw new Error('HTTP '+fres.status);
        }catch(ferr){
          throw new Error('Primary fetch failed ('+url+'), fallback failed ('+localUrl+')');
        }
      }
      if(!res.ok) throw new Error('HTTP '+res.status);
      let text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text,'text/html');

      // Compute a base for resolving relative assets based on the actual fetched URL
      const baseForAssets = (new URL(url, window.location.href)).href.replace(/[^/]+$/, '');

      // Make resource URLs absolute inside the fetched doc so assets load from the correct base
      doc.querySelectorAll('[src]').forEach(n=>{ const s = n.getAttribute('src'); if(s) try{ n.src = new URL(s, baseForAssets).href }catch(e){} });
      doc.querySelectorAll('[href]').forEach(n=>{ const h = n.getAttribute('href'); if(h && !h.startsWith('#')) try{ n.href = new URL(h, baseForAssets).href }catch(e){} });

      // Inject external CSS (host page) to preserve game's styles where appropriate
      doc.querySelectorAll('link[rel="stylesheet"]').forEach(link=>{
        const raw = link.getAttribute('href');
        if(!raw) return;
        const href = (()=>{ try{ return new URL(raw, baseForAssets).href }catch(e){ return raw } })();
        if(!document.querySelector('link[href="'+href+'"]')){
          const l = document.createElement('link'); l.rel='stylesheet'; l.href=href; l.setAttribute('data-injected','1'); document.head.appendChild(l);
        }
      });

      // build banner with extra controls similar to the example
      const title = doc.querySelector('title')?.textContent || 'Game';
      const banner = document.createElement('div'); banner.className='banner';
      banner.innerHTML = `<div class="title">${title}</div><div class="spacer"></div><button class="btn" id="openBtn">Open</button><button class="btn" id="dlBtn">Download</button><button class="btn" id="backBtn">Back</button><button class="btn" id="fsBtn">Fullscreen</button>`;

      clearInjected();
      gameView.appendChild(banner);

      // create wrapper and iframe
      const wrapper = document.createElement('div');
      wrapper.classList.add('injected');
      const gameWrapper = document.createElement('div');
      gameWrapper.className = 'game-wrapper';

      // ensure the fetched HTML has a base so relative assets resolve
      // Use the fetched page's directory as the base so relative paths work whether
      // the page was loaded from CDN or from the local site.
      const baseTag = `<base href="${baseForAssets}">`;
      const src = text.replace(/<head([^>]*)>/i, m => m + baseTag);
      const iframe = document.createElement('iframe');
      iframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-pointer-lock allow-popups');
      iframe.setAttribute('allow', 'fullscreen');
      iframe.allowFullscreen = true;
      iframe.srcdoc = src;
      iframe.style.border = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.setAttribute('data-injected', '1');

      gameWrapper.appendChild(iframe);
      wrapper.appendChild(gameWrapper);
      wrapper.setAttribute('data-injected','1');
      gameView.appendChild(wrapper);

      // show game view — hide page scrolling
      document.body.style.overflow = 'hidden';
      listView.classList.add('hidden'); gameView.classList.remove('hidden');

      // prepare a blob url of the HTML for open/download operations
      let pageBlobUrl = null;
      function ensureBlob(){
        if(pageBlobUrl) return pageBlobUrl;
        try{
          const b = new Blob([src], {type: 'text/html'});
          pageBlobUrl = URL.createObjectURL(b);
          createdBlobUrls.add(pageBlobUrl);
          return pageBlobUrl;
        }catch(e){console.warn('blob failed', e); return null}
      }

      // wire controls
      document.getElementById('backBtn').addEventListener('click',()=>{ clearInjected(); gameView.classList.add('hidden'); listView.classList.remove('hidden'); });
      document.getElementById('fsBtn').addEventListener('click',async ()=>{
        try{ if(!document.fullscreenElement) await gameView.requestFullscreen(); else await document.exitFullscreen(); }catch(e){console.warn(e)}
      });
      document.getElementById('openBtn').addEventListener('click',()=>{ const u = ensureBlob(); if(u) window.open(u,'_blank'); });
      document.getElementById('dlBtn').addEventListener('click',()=>{
        const u = ensureBlob();
        if(!u) return alert('Download not available');
        const a = document.createElement('a'); a.href = u; a.download = (title.replace(/[^a-z0-9]/gi,'_')||'game') + '.html'; document.body.appendChild(a); a.click(); a.remove();
      });

      // keyboard: ESC to close
      function onKey(e){ if(e.key === 'Escape'){ clearInjected(); gameView.classList.add('hidden'); listView.classList.remove('hidden'); document.removeEventListener('keydown', onKey); }}
      document.addEventListener('keydown', onKey);

    }catch(err){
      console.error(err); alert('Failed to load game');
    }
  }

  searchBar.addEventListener('input',render);
  render();
})();
