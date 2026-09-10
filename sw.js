/* 漫威宇宙·英雄纪元 PWA Service Worker
   策略：缓存游戏核心文件，离线可用，更新时后台刷新 */
const CACHE = 'marvel-hero-v2.6.2';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './v2.6_世界线完整版/2.6.html',
  './v2.6_世界线完整版/css/glass.css',
  './v2.6_世界线完整版/js/ai.js',
  './v2.6_世界线完整版/js/endingEngine.js',
  './v2.6_世界线完整版/js/eventDirector.js',
  './v2.6_世界线完整版/js/game_seed.js',
  './v2.6_世界线完整版/js/relationshipEngine.js',
  './v2.6_世界线完整版/js/worldlineEngine.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* 缓存优先 + 后台更新 */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  /* API 请求不缓存 */
  if (url.hostname.includes('open.bigmodel.cn') || url.hostname.includes('zhipu')) return;
  e.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(req, clone)).catch(() => {});
        }
        return resp;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
