const log = console.log;
const WIKI_API_CACHE = 'wiki-articles';
const WIKI_IMAGES_CACHE = 'wiki-images';

const SECTIONS = {
  home: {
    pathname: '/',
    name: 'home',
    id: 'section--home'
  },
  settings: {
    pathname: '/settings',
    name: 'settings',
    id: 'section--settings'
  },
  cached: {
    pathname: '/cached',
    name: 'cached',
    id: 'section--cached'
  },
  main: {
    pathname: '/main',
    name: 'main',
    id: 'section--article'
  },
  loader: {
    pathname: '/',
    name: 'loader',
    id: 'section--loader'
  }
};

// "swap" content in app shell
function displaySection(displaySection, path = null) {
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    if (section.id == displaySection.id) {
      section.classList.add('active');
      section.removeAttribute('hidden');
    } else {
      section.classList.remove('active');
      section.setAttribute('hidden', true);
    }
  });
  document.getElementById('content').scrollTo(0, 0);

  // toggle tabs
  document.querySelectorAll('.header--tab').forEach(tab => {
    if (tab.dataset.section == displaySection.name)
      tab.classList.add('active');
    else
      tab.classList.remove('active');
  });

  // push pathname to window.history to change URL
  if (displaySection.name != SECTIONS.loader.name)
    window.history.pushState({}, null, path || displaySection.pathname);
}

// display section based on tab selected
document.querySelectorAll('.header--tab').forEach(tab => {
  tab.addEventListener('click', (e) => {
    displaySection(SECTIONS[e.srcElement.dataset.section]);
  });
});

const searchInput = document.getElementById('searchInput');
const searchBar = document.getElementById('search-bar');

// toggle search bar visibility
function toggleSearchBar() {
  searchBar.classList.toggle('active');
  if (searchBar.classList.contains('active'))
    searchInput.focus();
  else
    searchInput.blur();
}

document.getElementById('back-btn').addEventListener('click', toggleSearchBar);
document.getElementById('search-btn').addEventListener('click', toggleSearchBar);

const articleHistoryContainer = document.getElementById('articleHistoryContainer');

function createArticleThumbnail(title) {
  let thumbnail = document.createElement('div');
  thumbnail.classList = "thumbnail";
  
  let spanTitleElm = document.createElement('span');
  spanTitleElm.classList = "thumbnail--articlename";
  spanTitleElm.innerText = title.replace(/_/g, " ");
  spanTitleElm.onclick = () => {
    fetchWikiPage(title);
  };

  let trashIconBtn = document.createElement('button');
  trashIconBtn.classList = "trash-icon";
  trashIconBtn.onclick = () => {
    deleteCachedEntry(title);
  };

  thumbnail.appendChild(spanTitleElm);
  thumbnail.appendChild(trashIconBtn);
  return thumbnail;
}

// TODO: implement logic to delete an article from the cache
async function deleteCachedEntry(title) {
  // ... 
}

// TODO: add logic to query articles cache and display cached articles
async function queryWikiCache() {
  // ... 
}

queryWikiCache();

// fetch Wiki page by title
async function fetchWikiPage(title) {
  displaySection(SECTIONS.loader);

  const response = await fetch(encodeURI(`/api/wiki/${title}`));
  const html = await response.text();

  displaySection(SECTIONS.main, `/article/${title}`);

  document.getElementById('content').scrollTo(0, 0);
  document.getElementById('section--article').innerHTML = html;

  queryWikiCache();
}

// override search form event
document.getElementById('searchForm').addEventListener('submit', (e) => {
  e.preventDefault();
  toggleSearchBar();
  let searchVal = searchInput.value.replace(/\s/g, "_");
  searchInput.value = '';
  fetchWikiPage(searchVal);
});

// override links to call fetchWikiPage(..)
const wikiRegExp = new RegExp("\/wiki\/(.*)");
document.onclick = function(e) {
  e = e || window.event;
  var element = e.target || e.srcElement;

  if (element.tagName == 'A' && wikiRegExp.test(e.srcElement.href)) {
    let searchTerm = wikiRegExp.exec(e.srcElement.href)[1];
    fetchWikiPage(searchTerm);
    return false;
  }
};

// update network connection status
function updateOnlineStatus() {
  document.getElementById('networkStatus').innerText = navigator.onLine ? "Online" : "Offline";
  document.getElementById('networkStatus').className = navigator.onLine ? "online" : "offline";
  document.querySelectorAll('header').forEach(header => {
    if (navigator.onLine)
      header.classList.remove('offline');
    else
      header.classList.add('offline');
  });
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

updateOnlineStatus();

// TODO: display storage information to user
function estimateStorage() {
  // ... 
}

estimateStorage();

// logic to display content depending on the URL
function initialLoad() {
  const pathname = window.location.pathname;
  // if it's an article page, fetch the page from cache
  if (pathname.match('/article/')) {
    const article = pathname.match(/article\/(.*)/)[1];
    fetchWikiPage(article);
  }
  // else display the requested section
  else {
    let section = null;
    switch (pathname) {
      case '/':
      case '/home':
      case '/index':
        section = SECTIONS.home;
        break;
      case '/cached':
        section = SECTIONS.cached;
        break;
      case '/settings':
        section = SECTIONS.settings;
        break;
      default:
        log('default');
        break;
    }
    if (section)
      displaySection(section);
  }

}
initialLoad();