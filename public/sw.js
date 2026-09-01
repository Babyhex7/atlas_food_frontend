// Atlas Food Service Worker (Offline-First PWA Engine)
const CACHE_NAME = "atlas-food-v1";
const STATIC_ASSETS = [
  "/",
  "/login",
  "/surveys",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
];

// Install Event — Pre-cache critical static app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Pre-cache partial warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event — Clean up stale caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event — Offline-First Caching Strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (e.g. POST /survey/submit — handled by IndexedDB offline queue)
  if (request.method !== "GET") return;

  // Skip API requests and WebSocket connections from Service Worker HTTP cache
  if (url.pathname.startsWith("/api/") || url.protocol === "ws:" || url.protocol === "wss:") {
    return;
  }

  // Network-First with Stale-While-Revalidate fallback for HTML navigation pages
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clonedResponse));
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const fallback = await caches.match("/");
          return fallback || new Response("Offline Mode — Atlas Food", { status: 503, headers: { "Content-Type": "text/html" } });
        })
    );
    return;
  }

  // Cache-First for static assets (images, fonts, scripts, stylesheets)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/uploads/") ||
    request.destination === "image" ||
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          }
          return networkResponse;
        });
      })
    );
    return;
  }
});
