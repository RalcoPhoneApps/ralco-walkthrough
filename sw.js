// RALCO Field Walkthrough — Service Worker
// Caches the app shell for offline use

const CACHE_NAME = 'ralco-walkthrough-v6';
const STATIC_ASSETS = [
  './ralco_walkthrough_v2.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// Install — cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', event => {
  // Don't intercept API calls to Render — those need live network
  if (event.request.url.includes('onrender.com')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        // Cache successful GET responses for static assets
        if (event.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback — return cached app
      return caches.match('./ralco_walkthrough_v2.html');
    })
  );
});
