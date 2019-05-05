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
