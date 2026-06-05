const CACHE_NAME = "bcn-metro-v1";
const OFFLINE_URL = "/";

const PRECACHE_URLS = [
  "/",
  "/icon.png",
  "/icon-192.png",
  "/manifest.json",
];

// Install: precache shell resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first with cache fallback
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== "GET") return;
  if (event.request.url.startsWith("chrome-extension://")) return;

  // For navigation requests — network first, fallback to cached page
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the latest page
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // For static assets: cache-first
  if (
    event.request.url.includes("/_next/static/") ||
    event.request.url.includes("/icon") ||
    event.request.url.endsWith(".png") ||
    event.request.url.endsWith(".svg") ||
    event.request.url.endsWith(".css") ||
    event.request.url.endsWith(".js")
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // For API/data requests: network-only (always fresh data)
  event.respondWith(fetch(event.request));
});
