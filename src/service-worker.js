// import the Workbox runtime libraries hosted on a highly-available 
// Google Cloud Storage instance
importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.1.1/workbox-sw.js');

// set Workbox debug mode to true
// Note: Ignore the error that Glitch raises about workbox being undefined.
workbox.setConfig({
  debug: true
});

// skip the waiting phase when SW is updated
workbox.core.skipWaiting();

self.addEventListener('install', (event) => {
  console.log('SW install event');
});

self.addEventListener('activate', (event) => {
  console.log('SW activate event');
});

// When workbox injectManifest is run, it looks for this specific string in your 
// source service worker file. It replaces the empty array with a list of URLs to 
// precache and writes the service worker file to its destination location, based 
// on the configuration options in workbox-config.js. The rest of the code in your 
// source service worker is left untouched.
workbox.precaching.precacheAndRoute([]);

// navigation route will return the app shell 'index.html' to all
// navigation requests
workbox.routing.registerNavigationRoute(
  workbox.precaching.getCacheKeyForURL('/index.html')
);

// cache Wiki article API calls
workbox.routing.registerRoute(
  new RegExp("\/api\/wiki"),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'wiki-articles'
  })
);

// cache Wiki article image assets
workbox.routing.registerRoute(
  new RegExp("https?:\/\/upload\.wikimedia\.org\/wikipedia\/.*\.(png|jpg|svg|jpeg)$"),
  new workbox.strategies.CacheFirst({
    cacheName: 'wiki-images',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 500, // max 500 images
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
      })
    ]
  })
);

// This "catch" handler is triggered when any of the other routes fail to
// generate a response. We will use this to return the offline partial page
// to wiki API requests if the Wiki API route above fails (i.e. cannot reach
// the network).
const apiRegExp = new RegExp("\/api\/wiki");
workbox.routing.setCatchHandler(({ event }) => {
  // match against API requests
  if (apiRegExp.test(event.request.url)) {
    // getCacheKeyForURL returns cache key for URL
    const key = workbox.precaching.getCacheKeyForURL('offline.partial.html');
    return caches.match(key);
  }
  // else return error response
  return Response.error();
});

