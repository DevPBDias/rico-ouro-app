/// <reference lib="webworker" />

export type {};
declare const self: ServiceWorkerGlobalScope;

const SCHEMA_VERSION = "v18"; // Incremented to invalidate old caches
const CACHE_NAME = `rico-ouro-cache-${SCHEMA_VERSION}`;

const ASSETS_TO_CACHE = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event: any) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log("Service Worker: Caching App Shell");
      // Cache assets one by one to avoid failure if one doesn't exist
      const cachePromises = ASSETS_TO_CACHE.map(async (url) => {
        try {
          await cache.add(url);
          console.log(`Service Worker: Cached ${url}`);
        } catch (error) {
          console.warn(`Service Worker: Failed to cache ${url}`, error);
        }
      });
      await Promise.all(cachePromises);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event: any) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Service Worker: Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event: any) => {
  // Ignore non-GET requests
  if (event.request.method !== "GET") return;

  // Ignore chrome-extension schemes
  if (event.request.url.startsWith("chrome-extension")) return;

  const url = new URL(event.request.url);

  // NAVIGATION (HTML pages) - Network-First with offline fallback
  if (
    event.request.mode === "navigate" ||
    event.request.headers.get("accept")?.includes("text/html")
  ) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Cache successful navigation responses
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Try cache first
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // If no cached response, return the root page (offline fallback)
            // This allows the app shell to load and handle the route client-side
            return caches.match("/").then((rootResponse) => {
              if (rootResponse) {
                return rootResponse;
              }

              // Last resort: generic offline page
              return new Response(
                `
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Offline - INDI Ouro</title>
                  <style>
                    body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      min-height: 100vh;
                      margin: 0;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      text-align: center;
                      padding: 20px;
                    }
                    .container {
                      max-width: 400px;
                    }
                    h1 { font-size: 48px; margin: 0 0 20px 0; }
                    p { font-size 18px; line-height: 1.6; }
                    a {
                      display: inline-block;
                      margin-top: 20px;
                      padding: 12px 24px;
                      background: white;
                      color: #667eea;
                      text-decoration: none;
                      border-radius: 8px;
                      font-weight: 600;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>📴</h1>
                    <h2>Você está offline</h2>
                    <p>Esta página não está disponível no cache. Por favor, conecte-se à internet e tente novamente.</p>
                    <a href="/">Voltar para Home</a>
                  </div>
                </body>
                </html>
                `,
                {
                  status: 503,
                  statusText: "Service Unavailable",
                  headers: new Headers({
                    "Content-Type": "text/html; charset=utf-8",
                  }),
                }
              );
            });
          });
        })
    );
    return;
  }

  // NETWORK-FIRST strategy for JavaScript files to ensure fresh code
  if (event.request.url.includes("/_next/") || url.pathname.endsWith(".js")) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Cache the fresh response
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || new Response("Offline", { status: 503 });
          });
        })
    );
    return;
  }

  // CACHE-FIRST strategy for other assets (images, fonts, CSS, etc.)
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          // Check if we received a valid response
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          // Clone the response
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          return new Response("Offline", { status: 503 });
        });
    })
  );
});

self.addEventListener("sync", (event: any) => {
  console.log("Service Worker: Sync event fired", event.tag);
  if (event.tag === "sync-data") {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Implement your background sync logic here
  // For RxDB, replication handles most of it, but this can be used for other tasks
  console.log("Service Worker: Executing background sync...");
  // Example: Check IndexedDB for pending tasks and process them
}
