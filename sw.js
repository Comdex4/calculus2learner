/* Service worker: cache the whole app so it works offline. Bump VERSION when files change. */
const VERSION = 'c2l-v1';
const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'assets/icon.svg', 'css/styles.css',
  'vendor/katex/katex.min.css', 'vendor/katex/katex.min.js',
  'js/core/util.js', 'js/core/expr.js', 'js/core/store.js', 'js/core/render.js', 'js/core/graph.js',
  'js/gen/base.js', 'js/gen/foundations.js', 'js/gen/calc1.js', 'js/gen/techniques.js', 'js/gen/applications.js', 'js/gen/series.js', 'js/gen/polar-bridge.js',
  'js/content/course.js', 'js/content/u-foundations.js', 'js/content/u-calc1.js', 'js/content/u-calc2.js', 'js/content/u-series.js', 'js/content/reference.js',
  'js/ui/shell.js', 'js/ui/widgets.js', 'js/ui/problem.js', 'js/ui/pages.js', 'js/app.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// stale-while-revalidate: instant loads from cache, refreshed in the background
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(res => { if (res && res.ok) cache.put(e.request, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
