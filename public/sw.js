const CACHE_NAME = 'utf-star-v1'
const RUNTIME_CACHE = 'utf-star-runtime'

const PRECACHE_URLS = ['/', '/index.html', '/manifest.json']

// 安装事件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS)
    })
  )
  self.skipWaiting()
})

// 激活事件
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map(name => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// 请求拦截
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // 跳过非同源请求
  if (url.origin !== location.origin) {
    return
  }

  // 网络优先策略
  event.respondWith(
    fetch(request)
      .then(response => {
        // 缓存成功的响应
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // 网络失败时使用缓存
        return caches.match(request).then(response => {
          return response || caches.match('/index.html')
        })
      })
  )
})
