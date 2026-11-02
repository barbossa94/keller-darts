// Service worker: precaches the whole app, so after the first load it runs fully offline.
const VERSION = 'kd-v3';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'icons/icon.svg',
  'icons/logo.svg',
  'icons/icon-maskable.png',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'js/app.js',
  'js/db.js',
  'js/camera.js',
  'js/x01.js',
  'js/stats.js',
  'js/fx.js',
  'js/i18n.js',
  'js/ui/common.js',
  'js/ui/home.js',
  'js/ui/players.js',
  'js/ui/profile.js',
  'js/ui/setup.js',
  'js/ui/play.js',
  'js/ui/board.js',
  'js/ui/settings.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first, so app updates show up right away; the cache answers when offline
// or when the network is too slow (weak basement Wi-Fi).
const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    Promise.race([fetch(e.request), timeout(2500)]).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || caches.match('index.html')))
  );
});
