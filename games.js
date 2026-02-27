// Editable list of games. Add entries to this array to add more games.
const games = [
  // First item is a request link to your Google Form (click opens the form)
  {
    title: 'Request a Game',
    img: 'https://via.placeholder.com/300x180.png?text=Request',
    page: 'https://docs.google.com/forms/d/e/1FAIpQLSfD-example-form/viewform' // <-- replace with your form URL (non-embedded)
  },
  // Example games (change title, img, page)
  {
    title: 'Snow Rider 3D',
    img: 'https://play-lh.googleusercontent.com/5qSxhoGrmuli1qu2qmF4Z8h2ecUitGs0iPXhPd2YD_3iptg8z9boQ8qI1fgTA8WusQ=w526-h296-rw',
    page: 'games/SnowRider3D.html'
  },
    {
    title: 'Snow Rider 3D',
    img: 'https://play-lh.googleusercontent.com/5qSxhoGrmuli1qu2qmF4Z8h2ecUitGs0iPXhPd2YD_3iptg8z9boQ8qI1fgTA8WusQ=w526-h296-rw',
    page: 'games/SnowRider3D.html'
  },
];

function initGames(){
  const container = document.getElementById('gamesContainer');
  const searchBar = document.getElementById('searchBar');

  function renderGames(filter = ''){
    container.innerHTML = '';
    const q = filter.trim().toLowerCase();

    const cdnBase = (document.querySelector('base')?.href) || 'https://cdn.jsdelivr.net/gh/hmrjtfhutt/unblocked@main/';
    games.forEach((g) => {
      if(q && !g.title.toLowerCase().includes(q)) return;

      const item = document.createElement('a');
      item.className = 'game-item';
      // Resolve game page to CDN path when a relative path is provided
      let finalHref = '#';
      if(g.page){
        if(/^https?:\/\//i.test(g.page)) finalHref = g.page;
        else finalHref = cdnBase + (g.page.startsWith('/') ? g.page.slice(1) : g.page);
      }
      item.href = finalHref;
      item.setAttribute('aria-label', g.title);
      // Open external links (like Google Forms) in a new tab
      if(/^https?:\/\//i.test(finalHref)){
        item.target = '_blank';
        item.rel = 'noopener noreferrer';
      }

      const img = document.createElement('img');
      img.src = g.img;
      img.alt = g.title;
      item.appendChild(img);

      const title = document.createElement('h3');
      title.textContent = g.title;
      item.appendChild(title);

      container.appendChild(item);
    });
  }

  // If a link points to a game on the CDN, fetch and render it in-page (no URL change)
  async function loadRemotePage(url){
    try{
      const res = await fetch(url, {cache: 'no-store'});
      if(!res.ok) throw new Error('HTTP '+res.status);
      let text = await res.text();
      // ensure base points to cdn
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const cdn = (document.querySelector('base')?.href) || 'https://cdn.jsdelivr.net/gh/hmrjtfhutt/unblocked@main/';
      const existing = doc.querySelector('base'); if(existing) existing.remove();
      const b = doc.createElement('base'); b.setAttribute('href', cdn); doc.head.insertBefore(b, doc.head.firstChild);
      document.open(); document.write('<!DOCTYPE html>\n'+doc.documentElement.outerHTML); document.close();
    }catch(e){ console.error('loadRemotePage failed', e); }
  }

  container?.addEventListener('click', (ev)=>{
    const a = ev.target.closest && ev.target.closest('a');
    if(!a) return;
    const href = a.href || a.getAttribute('href');
    if(!href) return;
    // Only intercept CDN-hosted game pages (in /games/)
    if(/\/games\//i.test(href) && /cdn.jsdelivr.net\/gh\/hmrjtfhutt\/unblocked/i.test(href)){
      ev.preventDefault();
      loadRemotePage(href);
    }
  });

  searchBar?.addEventListener('input', (e) => renderGames(e.target.value));

  // Initial render
  renderGames();

  // Responsive column logic: we prefer 6 items per row on medium widths but allow more if space permits.
  function adjustGridColumns(){
    const minItemWidth = 150; // matches CSS
    const gap = 20; // matches CSS gap
    const containerWidth = document.documentElement.clientWidth - 40; // account for padding
    const possible = Math.floor((containerWidth + gap) / (minItemWidth + gap));
    // keep at least 1 column
    const cols = Math.max(1, possible);
    // apply as CSS grid style if container uses grid
    container.style.gridTemplateColumns = `repeat(${cols}, minmax(${minItemWidth}px, 1fr))`;
  }

  window.addEventListener('resize', adjustGridColumns);
  adjustGridColumns();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initGames);
} else {
  initGames();
}
