// import the Workbox runtime libraries hosted on a highly-available 
// Google Cloud Storage instance
importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.0/workbox-sw.js');

// set Workbox debug mode to true
// Note: Ignore the error that Glitch raises about workbox being undefined.
workbox.setConfig({
  debug: true
});

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