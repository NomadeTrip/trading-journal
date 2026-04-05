/**
 * Service Worker — Trading Journal Pro
 * Permite instalar la PWA y gestionar caché básico
 */

const CACHE_NAME = "trading-journal-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png", // Ruta corregida
  "/icons/icon-512.png", // Ruta corregida
];

// Instalar el Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usamos un enfoque más robusto: si un archivo falla, los demás se cachean
      return Promise.allSettled(
        urlsToCache.map(url => cache.add(url))
      ).then(() => {
        console.log("Caché inicial completado");
      });
    })
  );
  self.skipWaiting();
});

// Activar el Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar requests (estrategia: network first, fallback to cache)
self.addEventListener("fetch", (event) => {
  // Solo interceptar peticiones GET y evitar APIs externas o Supabase para no causar conflictos
  if (event.request.method !== "GET" || event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // No cachear respuestas que no sean exitosas o sean de extensiones del navegador
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // Clonar la respuesta para guardarla en caché
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Si falla la red (offline), intentar obtener del caché
        return caches.match(event.request).then((cachedResponse) => {
          return (
            cachedResponse ||
            new Response("Estás desconectado y este recurso no está en el caché.", {
              status: 503,
              statusText: "Service Unavailable",
            })
          );
        });
      })
  );
});
