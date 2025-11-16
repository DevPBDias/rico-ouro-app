// Minimal service worker tuned for Next.js App Router deployments.
// Purpose: provide offline fallback and runtime caching for safe assets,
// avoiding precaching of dynamic `_next` manifests (prevents bad-precaching-response).

const CACHE_NAME = "app-cache-v1";
const RUNTIME = "runtime-cache-v1";
const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/logo.svg",
  "/manifest.json",
  "/splash.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Cleanup old caches
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== RUNTIME)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// Simple helper: respond with network first for navigation/pages, cache-first for static assets
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Avoid attempting to precache dynamic build manifest or other unpredictable build-time files
  // (This is the core fix for `bad-precaching-response` when using automated precache lists.)
  if (url.pathname.endsWith("/app-build-manifest.json")) return;

  // Runtime caching rules
  if (url.pathname.startsWith("/_next/static/")) {
    // Cache static _next files (hashed) with CacheFirst
    event.respondWith(
      caches.open(RUNTIME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const res = await fetch(event.request);
          if (res && res.status === 200) cache.put(event.request, res.clone());
          return res;
        } catch (err) {
          return (
            cached ||
            fetch(event.request).catch(() => caches.match("/offline.html"))
          );
        }
      })
    );
    return;
  }

  if (url.pathname.startsWith("/_next/image")) {
    // Stale-While-Revalidate behaviour for optimized images
    event.respondWith(
      caches.open(RUNTIME).then(async (cache) => {
        const cached = await cache.match(event.request);
        const networkFetch = fetch(event.request)
          .then((res) => {
            if (res && res.status === 200)
              cache.put(event.request, res.clone());
            return res;
          })
          .catch(() => null);
        return cached || (await networkFetch) || caches.match("/offline.html");
      })
    );
    return;
  }

  // For navigation requests (HTML pages) use NetworkFirst with a short timeout
  if (
    event.request.mode === "navigate" ||
    (event.request.headers.get("accept") || "").includes("text/html")
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME);
        try {
          const resp = await Promise.race([
            fetch(event.request),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("timeout")), 3000)
            ),
          ]);
          if (resp && resp.status === 200) {
            cache.put(event.request, resp.clone());
          }
          return resp;
        } catch (err) {
          const cached = await cache.match(event.request);
          return cached || caches.match("/offline.html");
        }
      })()
    );
    return;
  }

  // Default fallback: try network then cache then offline page
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // Optionally, cache successful GET responses for later
        return res;
      })
      .catch(() =>
        caches
          .match(event.request)
          .then((r) => r || caches.match("/offline.html"))
      )
  );
});

// Keep worker alive for debugging messages
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/*
  Notes:
  - We intentionally avoid precaching `_next` dynamic manifests like `app-build-manifest.json`.
  - Use runtime caching for `_next/static/*` and `_next/image/*` which are safe (hashed files).
  - Precaching should be limited to stable public assets and `/offline.html`.
*/
