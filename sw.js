// Kraftbuch Service Worker: macht die App offline nutzbar.
// Deine Trainingsdaten liegen NICHT hier, sondern im lokalen Speicher der App.
const CACHE = 'kraftbuch-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Sofort aus dem Cache starten (schnell, auch bei schlechtem Netz im Gym),
// im Hintergrund nach Updates schauen.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const cached = await c.match(e.request, { ignoreSearch: true });
    const fresh = fetch(e.request).then(res => { if (res.ok) c.put(e.request, res.clone()); return res; }).catch(() => null);
    return cached || (await fresh) || c.match('./index.html');
  }));
});
