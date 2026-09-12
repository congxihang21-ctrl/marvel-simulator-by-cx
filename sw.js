/* 漫威宇宙·英雄纪元 PWA Service Worker
   策略：
   - 导航请求（HTML 页面，含根 index.html 跳转脚本）→ 网络优先，失败才回退缓存（保证发版立即可见）
   - 静态资源（css/js/json/img）→ 缓存优先 + 后台更新（stale-while-revalidate，秒开）
   - 新 SW 激活后强制 claim 所有页面 + 广播更新通知 */
const CACHE = 'marvel-hero-v2.6.2';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './v2.6.2_开档向导版/2.6.2.html',
  './v2.6.2_开档向导版/css/design-tokens.css',
  './v2.6.2_开档向导版/css/glass.css',
  './v2.6.2_开档向导版/css/components.css',
  './v2.6.2_开档向导版/css/responsive.css',
  './v2.6.2_开档向导版/js/ai.js',
  './v2.6.2_开档向导版/js/endingEngine.js',
  './v2.6.2_开档向导版/js/eventDirector.js',
  './v2.6.2_开档向导版/js/game_seed.js',
  './v2.6.2_开档向导版/js/relationshipEngine.js',
  './v2.6.2_开档向导版/js/worldlineEngine.js',
  './v2.6.2_开档向导版/js/characterEngine.js',
  './v2.6.2_开档向导版/js/seed_data.js',
  './v2.6.2_开档向导版/js/rng.js'
];

/* 是否为导航请求（HTML 页面）—— 这类必须网络优先，保证发版后用户立刻看到新版 */
function isNavigation(req) {
  if (req.mode === 'navigate') return true;
  if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) return true;
  return false;
}

self.addEventListener('install', e => {
  /* 关键：只有新缓存写入成功后才 skipWaiting。
     若 addAll 失败（网络抖动/某文件 404），新 SW 停在 installing，
     旧 SW 继续服务旧页面，不会出现「旧缓存已删、新缓存没好」的断档卡死。 */
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
      )
    ])
    /* 不主动广播刷新：由前端 controllerchange 统一处理，避免与 claim 竞争导致重复 reload */
  );
});

/* 消息协议：前端可主动让 SW 跳过等待立即激活 */
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data && e.data.type === 'GET_VERSION') {
    e.source.postMessage({ type: 'VERSION_RESPONSE', version: CACHE, isWaiting: !self.clients.claim });
  }
  /* 自愈：前端发现缓存损坏/资源 404 时调用，清掉所有缓存并注销 SW，让页面下次加载完全走网络 */
  if (e.data && e.data.type === 'SELF_HEAL') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll())
      .then(clients => { clients.forEach(c => c.postMessage({ type: 'HEAL_DONE' })); });
  }
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  /* API 请求不缓存 */
  if (url.hostname.includes('open.bigmodel.cn') || url.hostname.includes('zhipu')) return;

  if (isNavigation(req)) {
    /* HTML 页面：网络优先，失败回退缓存 */
    e.respondWith(
      fetch(req).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(req, clone)).catch(() => {});
        }
        return resp;
      }).catch(() => caches.match(req).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  /* 其他静态资源：缓存优先 + 后台更新 */
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
