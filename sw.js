const CACHE_NAME = 'arl-cache-v3.3';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/base.css',
  './css/components.css',
  './css/animations.css',
  './js/app.js',
  './js/db.js',
  './js/state.js',
  './js/srs.js',
  './js/unicode.js',
  './js/i18n.js',
  './js/keyboard.js',
  './js/gamification.js',
  './js/hints.js',
  './js/gemini.js',
  './js/diff.js',
  './js/grammar-pip.js',
  './js/grammar-fallback.js',
  './js/sound.js',
  './js/manual-entry.js',
  './js/telemetry.js',
  './js/sync.js',
  './js/views/hud.js',
  './js/views/study.js',
  './js/views/memorize.js',
  './js/views/quiz.js',
  './js/views/lexicon.js',
  './js/views/grammar.js',
  './js/views/notes.js',
  './js/views/media.js',
  './js/views/stats.js',
  './js/views/sync-modal.js',
  './js/views/settings.js',
  './js/views/help.js',
  './data/i18n.json',
  './data/b1_words.json',
  './data/de/vocab_a1.json',
  './data/de/vocab_a2.json',
  './data/de/vocab_b1.json',
  './data/de/vocab_b2.json',
  './data/de/grammar.json',
  './data/de/redemittel.json',
  './data/de/immersion.json',
  './data/en/vocab_a1.json',
  './data/en/vocab_a2.json',
  './data/en/vocab_b1.json',
  './data/en/vocab_b2.json',
  './data/en/grammar.json',
  './data/en/redemittel.json',
  './data/en/immersion.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/favicon.svg',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First with Cache Fallback: ensures latest updates are seen immediately while retaining 100% offline support
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
      }
      return networkResponse;
    }).catch(() => {
      return caches.match(event.request);
    })
  );
});
