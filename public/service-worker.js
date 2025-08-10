const CACHE_NAME = 'aac-web-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/aac-192x192.png',
  '/aac-512x512.png',
  // Add more static assets or routes as needed
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
