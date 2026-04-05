/**
 * Service Worker — Trading Journal Pro
 * Permite instalar la PWA y gestionar caché básico
 */

const CACHE_NAME = "trading-journal-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

// Instalar el Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => {
        // Si falla el caché, continuamos sin él (la app sigue funcionando)
        console.log("Cache setup skipped");
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
  // Solo cachear GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // No cachear respuestas que no sean exitosas
        if (!response || response.status !== 200 || response.type === "error") {
          return response;
        }

        // Clonar la respuesta
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Si falla la red, intentar obtener del caché
        return caches.match(event.request).then((cachedResponse) => {
          return (
            cachedResponse ||
            new Response("Offline - No cached version available", {
              status: 503,
              statusText: "Service Unavailable",
            })
          );
        });
      })
  );
});
