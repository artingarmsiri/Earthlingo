/* sw.js - Zero-Build Offline Service Worker for Earthlingo */
const CACHE_NAME = 'earthlingo-v14-pwa';

const CORE_ASSETS = [
  './',
  './index.html',
  './favicon.svg',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './libs/globe.gl.min.js',
  './styles/tokens.css',
  './styles/layout.css',
  './styles/overlays.css',
  './styles/drawer.css',
  './styles/responsive.css',
  './data/world_countries.js',
  './data/languages.js',
  './data/origins.js',
  './data/etymology.js',
  './data/scripts_info.js',
  './data/historical_eras.js',
  './src/core/config.js',
  './src/core/state.js',
  './src/core/utils.js',
  './src/core/router.js',
  './src/data/geo-index.js',
  './src/globe/bathymetry.js',
  './src/globe/pins.js',
  './src/globe/polygon-batcher.js',
  './src/globe/arcs.js',
  './src/globe/scene.js',
  './src/overlays/label-formatter.js',
  './src/overlays/map-overlays.js',
  './src/ui/tooltip.js',
  './src/ui/passport.js',
  './src/ui/script-inspector.js',
  './src/ui/trip.js',
  './src/ui/drawer.js',
  './src/ui/compare.js',
  './src/ui/quiz.js',
  './src/ui/legend.js',
  './src/ui/timeline.js',
  './src/ui/search.js',
  './src/ui/list-modal.js',
  './src/ui/controls.js',
  './src/main.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        CORE_ASSETS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => null)
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigation & local asset cache-first with background refresh (ignores ?v= query string!)
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      const networkFetch = fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() => cached);

      return cached || networkFetch;
    })
  );
});

