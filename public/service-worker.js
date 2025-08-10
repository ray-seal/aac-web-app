const CACHE_NAME = 'aac-web-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/aac-192x192.png',
  '/aac-512x512.png',
  // Add any built JS/CSS files that your app outputs (update after each build)
  // For example, if using Vite or CRA, add:
  // '/assets/index-xxxxx.js',
  // '/assets/index-xxxxx.css',
];

// Install: cache all app shell assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Fetch: serve cached assets, fallback to /index.html for navigation requests
self.addEventListener('fetch', event => {
  const { request } = event;

  // For navigation requests (HTML), always serve index.html (for SPA/client routing)
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then(response =>
        response || fetch('/index.html')
      )
    );
    return;
  }

  // For other assets, serve cache if available, else fetch from network
  event.respondWith(
    caches.match(request).then(response =>
      response || fetch(request)
    )
  );
});
