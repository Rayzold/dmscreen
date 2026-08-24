// Service worker for the DM Screen prototype.
// The page has no external dependencies (React, ReactDOM, and the fonts are all
// vendored locally), so caching every same-origin GET makes it fully installable
// and usable offline after the first visit.
const CACHE = 'dmscreen-v1';
const SHELL = './DM%20Screen.dc.html';
const CORE = [
  SHELL,
  './support.js',
  './manifest.webmanifest',
  './icon.svg',
  './vendor/react.production.min.js',
  './vendor/react-dom.production.min.js',
  './vendor/fonts/fonts.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first, with runtime caching of anything new (e.g. the woff2 subsets the
// browser picks). Falls back to the app shell if a navigation fails offline.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(SHELL));
    })
  );
});
