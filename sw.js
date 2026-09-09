// Service Worker - 制茶模拟器
const CACHE_VERSION = 'v1.2.0';
const SHELL_CACHE = `tea-simulator-shell-${CACHE_VERSION}`;
const DATA_CACHE = `tea-simulator-data-${CACHE_VERSION}`;

// App Shell 资源（首次安装时缓存）
const SHELL_URLS = [
  './',
  './index.html',
  './manifest.json',
  './styles.css',
  './tea-data.js',
  './data-layer.js',
  './app.jsx',
  './components/home.jsx',
  './components/craft-simulator.jsx',
  './components/quiz.jsx',
  './components/library.jsx',
  './components/achievements.jsx',
  './components/onboarding.jsx',
  './components/pwa.jsx',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

// 安装阶段：缓存 App Shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => {
      return Promise.all(
        SHELL_URLS.map(url => {
          return fetch(url, { credentials: 'same-origin' })
            .then(response => {
              if (response.ok) {
                cache.put(url, response);
              }
            })
            .catch(() => {
              // 单个资源失败不阻断安装
              console.log('SW install: skip', url);
            });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== SHELL_CACHE && key !== DATA_CACHE)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 请求拦截：缓存优先，回退网络
self.addEventListener('fetch', event => {
  const request = event.request;

  // 只处理 GET 请求
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 跳过非同源请求（外部CDN字体等由浏览器管理）
  if (url.origin !== location.origin) {
    // 外部字体/CDN资源：缓存优先策略
    if (url.host.includes('feishucdn.com') || url.host.includes('feishu.cn')) {
      event.respondWith(
        caches.match(request).then(cached => {
          return cached || fetch(request).then(response => {
            // 外部资源也缓存起来，提升二次访问速度
            const copy = response.clone();
            caches.open(DATA_CACHE).then(cache => cache.put(request, copy));
            return response;
          }).catch(() => cached);
        })
      );
    }
    return;
  }

  // 导航请求：网络优先，失败回退缓存的 index.html（SPA 离线模式）
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 静态资源：缓存优先
  const isShell = SHELL_URLS.some(u => url.pathname.endsWith(u.replace('./', '/').replace('./', ''))) 
    || url.pathname.includes('/components/')
    || url.pathname.includes('/assets/')
    || url.pathname.endsWith('.css')
    || url.pathname.endsWith('.js')
    || url.pathname.endsWith('.jsx');

  if (isShell) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        }).catch(() => cached);
      })
    );
  }
});

// 接收来自客户端的消息：跳过等待、立即激活新版本
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
