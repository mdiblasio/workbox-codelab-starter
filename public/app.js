const log = console.log;
const WIKI_API_CACHE = 'wiki-api';
const WIKI_IMAGES_CACHE = 'wiki-images';

const SECTIONS = {
  home: {
    pathname: '/home',
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
    id: 'section--main'
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
  let elm = document.createElement('div');
  elm.classList = "thumbnail";
  elm.onclick = () => {
    fetchWikiPage(title);
  };
  // replace underscores with spaces for diplaying titles
  elm.innerText = title.replace(/_/g, " ");
  return elm;
}

// query cache and populate cached articles list
async function queryWikiCache() {
  articleHistoryContainer.innerHTML = `<p><i>No articles cached</i></p>`;
  
  // TODO: add logic to query articles cache and display cached articles

  estimateStorage();
}

queryWikiCache();

// fetch Wiki page by title
async function fetchWikiPage(title) {
  displaySection(SECTIONS.loader);

  const response = await fetch(encodeURI(`/api/wiki/${title}`));
  const html = await response.text();

  displaySection(SECTIONS.main, `/article/${title}`);

  document.getElementById('content').scrollTo(0, 0);
  document.getElementById('section--main').innerHTML = html;

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

// clear cached articles
function clearCache() {
  caches.delete(WIKI_API_CACHE);
  caches.delete(WIKI_IMAGES_CACHE);
  queryWikiCache();
}

document.getElementById('clearCacheBtn').addEventListener('click', clearCache);

// override links to call fetchWikiPage(..)
document.onclick = function(e) {
  e = e || window.event;
  var element = e.target || e.srcElement;

  if (element.tagName == 'A' && e.srcElement.href.match(/wiki\/(.*)/)) {
    let searchTerm = e.srcElement.href.match(/wiki\/(.*)/)[1];
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

// display storage information to user
function estimateStorage() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    navigator.storage.estimate().then(({ usage, quota }) => {
      document.getElementById('storageUsed').innerText = usage;
      document.getElementById('storageAvailable').innerText = quota;
      document.getElementById('storageUsage').innerText = `${Math.floor(usage / quota * 100)}%`;
    });
  }
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

/*



const SECTIONS = {
  home: {
    pathname: '/home',
    name: 'home',
    id: 'section--home',
    tabId: 'tab--home'
  },
  settings: {
    pathname: '/settings',
    name: 'settings',
    id: 'section--settings',
    tabId: 'tab--settings'
  },
  cached: {
    pathname: '/cached',
    name: 'cached',
    id: 'section--cached',
    tabId: 'tab--cached'
  },
  main: {
    pathname: '/main',
    name: 'main',
    id: 'section--main',
    tabId: null
  },
  loader: {
    pathname: '/',
    name: 'loader',
    id: 'section--loader',
    tabId: null
  }
};






The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC
"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"

1914 translation by H. Rackham
"But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?"

Section 1.10.33 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC
"At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."

1914 translation by H. Rackham
"On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC
"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"

1914 translation by H. Rackham
"But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?"

Section 1.10.33 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC
"At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."

1914 translation by H. Rackham
"On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC
"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"

1914 translation by H. Rackham
"But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?"

Section 1.10.33 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC
"At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."

1914 translation by H. Rackham
"On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains."

*/