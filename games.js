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
    title: 'Sample Game 1',
    img: 'https://via.placeholder.com/300x180.png?text=Game+1',
    page: 'games/sample-game-1.html'
  },
  {
    title: 'Sample Game 2',
    img: 'https://via.placeholder.com/300x180.png?text=Game+2',
    page: 'games/sample-game-2.html'
  },
  {
    title: 'Sample Game 3',
    img: 'https://via.placeholder.com/300x180.png?text=Game+3',
    page: 'games/sample-game-3.html'
  },
  {
    title: 'Sample Game 4',
    img: 'https://via.placeholder.com/300x180.png?text=Game+4',
    page: 'games/sample-game-4.html'
  },
  {
    title: 'Sample Game 5',
    img: 'https://via.placeholder.com/300x180.png?text=Game+5',
    page: 'games/sample-game-5.html'
  },
  {
    title: 'Snow Rider 3D',
    img: 'https://via.placeholder.com/300x180.png?text=Game+6',
    page: 'games/SnowRider3D.html'
  }
];

const container = document.getElementById('gamesContainer');
const searchBar = document.getElementById('searchBar');

function renderGames(filter = ''){
  container.innerHTML = '';
  const q = filter.trim().toLowerCase();

  games.forEach((g, idx) => {

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

searchBar.addEventListener('input', (e) => renderGames(e.target.value));

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
