// CM FIX Service Worker - Versión 2.0 (Resistente a desincronizaciones y con bypass de API)
const CACHE_NAME = 'cmfix-cache-v2.1';
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

// Instalación: Pre-cache de archivos estáticos esenciales
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

// Activación: Limpieza rigurosa de cachés antiguos (como cmfix-cache-v1)
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

// Forzar actualización inmediata si el cliente lo solicita
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
  // Nunca guardar en caché llamadas a Supabase para evitar datos obsoletos o cambios no guardados
  if (
    url.hostname.includes('supabase.co') || 
    url.pathname.startsWith('/rest/v1') || 
    url.pathname.startsWith('/auth/v1') ||
    url.protocol === 'chrome-extension:'
  ) {
    return; // Pasa directo a red sin tocar Service Worker
  }

  // 3. NAVEGACIÓN (HTML Principal): ESTRATEGIA NETWORK-FIRST
  // Siempre intentar obtener la última versión de la web desplegada.
  // Si no hay conexión (offline), usar la copia en caché de index.html.
  if (request.mode === 'navigate') {
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
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // 4. ASSETS ESTÁTICOS LOCALES (JS, CSS, IMÁGENES): STALE-WHILE-REVALIDATE CON BYPASS DE VERSIONES
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});
