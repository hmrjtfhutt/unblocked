(function(){
  const cdn = 'https://cdn.jsdelivr.net/gh/hmrjtfhutt/unblocked@main/';
  const games = [
    {title:'Request a Game',img:'https://via.placeholder.com/300x180.png?text=Request',page:'https://docs.google.com/forms/d/e/1FAIpQLSfD-example-form/viewform'},
    {title:'Snow Rider 3D',img:'https://play-lh.googleusercontent.com/5qSxhoGrmuli1qu2qmF4Z8h2ecUitGs0iPXhPd2YD_3iptg8z9boQ8qI1fgTA8WusQ=w526-h296-rw',page:'games/SnowRider3D.html'}
  ];

  const listView = document.getElementById('listView');
  const gamesContainer = document.getElementById('gamesContainer');
  const searchBar = document.getElementById('searchBar');
  const gameView = document.getElementById('gameView');

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
    // remove any previously injected stylesheet/script tags we added
    document.querySelectorAll('[data-injected]').forEach(n=>n.remove());
    // if fullscreen, exit it so injected content isn't left active
    try{ if(document.fullscreenElement) document.exitFullscreen(); }catch(e){}
    // clear game view fully
    gameView.innerHTML = '';
    // try to reset scroll
    try{ window.scrollTo(0,0); }catch(e){}
  }

  async function onClickGame(e){
    e.preventDefault();
    const page = e.currentTarget.dataset.page;
    let url = page;
    if(!/^https?:\/\//i.test(page)) url = makeAbsolute(page);
    // If external (not CDN), just open in new tab
    if(!/cdn.jsdelivr.net\/gh\/hmrjtfhutt\/unblocked/i.test(url) && /^https?:\/\//i.test(url)){
      window.open(url,'_blank','noopener');
      return;
    }

    try{
      const res = await fetch(url,{cache:'no-store'});
      if(!res.ok) throw new Error('HTTP '+res.status);
      let text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text,'text/html');

      // Make resource URLs absolute
      doc.querySelectorAll('[src]').forEach(n=>{n.src = makeAbsolute(n.getAttribute('src'))});
      doc.querySelectorAll('[href]').forEach(n=>{const h=n.getAttribute('href'); if(h && !h.startsWith('#')) n.href = makeAbsolute(h)});

      // Inject CSS links (mark injected)
      doc.querySelectorAll('link[rel="stylesheet"]').forEach(link=>{
        const href = makeAbsolute(link.getAttribute('href'));
        if(!document.querySelector('link[href="'+href+'"]')){
          const l = document.createElement('link'); l.rel='stylesheet'; l.href=href; l.setAttribute('data-injected','1'); document.head.appendChild(l);
        }
      });

      // Inject title/banner
      const title = doc.querySelector('title')?.textContent || 'Game';
      const banner = document.createElement('div'); banner.className='banner';
      banner.innerHTML = `<div class="title">${title}</div><div class="spacer"></div><button class="btn" id="backBtn">Back</button><button class="btn" id="fsBtn">Fullscreen</button>`;

      clearInjected();
      gameView.appendChild(banner);

      // Move body children into container
      const bodyChildren = doc.body ? Array.from(doc.body.childNodes) : [];
      const wrapper = document.createElement('div');
      wrapper.classList.add('injected');

      // create a centered game wrapper with 16:9 aspect
      const gameWrapper = document.createElement('div');
      gameWrapper.className = 'game-wrapper';

      bodyChildren.forEach(n=>{
        // import node into current document
        // append into the gameWrapper so we can enforce sizing
        gameWrapper.appendChild(document.importNode(n,true));
      });

      wrapper.appendChild(gameWrapper);
      wrapper.setAttribute('data-injected','1');
      gameView.appendChild(wrapper);

      // Resize any iframe/canvas inside the injected content to fill the 16:9 wrapper
      gameWrapper.querySelectorAll('iframe, canvas').forEach(el=>{
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.display = 'filex';
      });

      // Execute scripts from fetched doc (in order)
      const scripts = doc.querySelectorAll('script');
      for(const s of scripts){
        const ns = document.createElement('script');
        if(s.src){ ns.src = makeAbsolute(s.getAttribute('src')); ns.async = false; ns.setAttribute('data-injected','1'); document.body.appendChild(ns); await new Promise(r=>ns.onload=r); }
        else { ns.textContent = s.textContent; ns.setAttribute('data-injected','1'); document.body.appendChild(ns); }
      }

      // show game view — hide page scrolling and pin injected area
      document.body.style.overflow = 'hidden';
      listView.classList.add('hidden'); gameView.classList.remove('hidden');

      // wire back/fullscreen
      document.getElementById('backBtn').addEventListener('click',()=>{ clearInjected(); document.body.style.overflow=''; gameView.classList.add('hidden'); listView.classList.remove('hidden'); window.scrollTo(0,0); });
      document.getElementById('fsBtn').addEventListener('click',async ()=>{
        try{ if(!document.fullscreenElement) await gameView.requestFullscreen(); else await document.exitFullscreen(); }catch(e){console.warn(e)}
      });

    }catch(err){
      console.error(err); alert('Failed to load game');
    }
  }

  searchBar.addEventListener('input',render);
  render();
})();