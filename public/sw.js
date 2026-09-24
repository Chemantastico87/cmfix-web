// CM FIX Service Worker - Versión 2.3 (Network-First para cambios instantáneos y bypass de API)
const CACHE_NAME = 'cmfix-cache-v2.3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/cmfix-logo.png',
  '/cmfix-badge.png',
  '/CMfix.png'
];

// Instalación: Pre-cache de archivos estáticos esenciales y activación inmediata
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('SW: Error precacheando algunos assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activación: Limpieza exhaustiva de cachés antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('SW: Eliminando caché obsoleto:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Forzar activación inmediata al recibir mensaje
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Estrategia de Fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. NUNCA interceptar peticiones que no sean GET
  if (request.method !== 'GET') return;

  // 2. CRUCIAL: BYPASS TOTAL A SUPABASE Y APIS EXTERNAS
  // Nunca guardar en caché llamadas a Supabase ni autenticación para garantizar datos en vivo
  if (
    url.hostname.includes('supabase.co') || 
    url.pathname.startsWith('/rest/v1') || 
    url.pathname.startsWith('/auth/v1') ||
    url.protocol === 'chrome-extension:'
  ) {
    return; // Pasa directo a red sin tocar Service Worker
  }

  // 3. ESTRATEGIA NETWORK-FIRST PARA TODOS LOS ARCHIVOS DEL ORIGEN
  // Intenta siempre obtener la versión más reciente desplegada en el servidor.
  // Si no hay conexión o falla la red, recurre a la copia en caché (soporte offline).
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            if (request.mode === 'navigate') {
              return caches.match('/index.html') || caches.match('/');
            }
            return new Response('Sin conexión', { status: 503, statusText: 'Offline' });
          });
        })
    );
  }
});
