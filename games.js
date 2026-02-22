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
];

function initGames(){
  const container = document.getElementById('gamesContainer');
  const searchBar = document.getElementById('searchBar');

  function renderGames(filter = ''){
    container.innerHTML = '';
    const q = filter.trim().toLowerCase();

    games.forEach((g) => {
      if(q && !g.title.toLowerCase().includes(q)) return;

      const item = document.createElement('a');
      item.className = 'game-item';
      item.href = g.page || '#';
      item.setAttribute('aria-label', g.title);
      // Open external links (like Google Forms) in a new tab
      if(g.page && /^https?:\/\//i.test(g.page)){
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
