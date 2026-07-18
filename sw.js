// Minimal service worker: caches the app shell (this HTML/CSS/JS file,
// manifest, icons) so the app still loads with no network at all. Actual
// data comes from Firestore (with its own offline persistence) and
// localStorage, not from this cache — this only makes sure the app *shell*
// itself isn't blank when you're offline.
//
// Uses a network-first strategy for index.html so you always get the latest
// deployed version when you have a connection, and only falls back to the
// cached copy when offline. Bump CACHE_NAME whenever you want to force
// clients to drop old cached assets.

const CACHE_NAME = 'turo-ops-shell-v1';
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-180.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Best-effort: don't fail install if an icon isn't there yet.
      return Promise.all(
        SHELL_FILES.map((url) => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
