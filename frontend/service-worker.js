const cacheName = 'clinica-v1'
const arquivos = [
  '/',
  '/index.html',
  '/painel.html',
  '/style.css',
  '/auth.js',
  '/painel.js',
  '/manifest.json'
]

self.addEventListener('install', event => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(arquivos))
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(chaves =>
      Promise.all(chaves.filter(c => c !== cacheName).map(c => caches.delete(c)))
    )
  )
})

// Rede primeiro (sempre pega a versão nova); cache só como reserva offline.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || event.request.url.includes('/api')) return

  event.respondWith(
    fetch(event.request)
      .then(resposta => {
        const copia = resposta.clone()
        caches.open(cacheName).then(cache => cache.put(event.request, copia))
        return resposta
      })
      .catch(() => caches.match(event.request))
  )
})
