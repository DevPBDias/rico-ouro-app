/// <reference lib="webworker" />

export type {};
declare const self: ServiceWorkerGlobalScope;

const SCHEMA_VERSION = "v21"; // Added PWA assets to cache
const CACHE_NAME = `rico-ouro-cache-${SCHEMA_VERSION}`;

// All static routes and assets to be precached on install
// Dynamic routes are cached proactively when user visits list pages
const ASSETS_TO_CACHE = [
  // Core
  "/",
  "/manifest.json",
  "/offline.html",

  // PWA Icons
  "/logo.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-192.png",
  "/icon-maskable-512.png",
  "/apple-touch-icon.png",
  "/splash.png",

  // Auth
  "/login",
  "/home",

  // Main pages (protected)
  "/bois",
  "/matrizes",
  "/cadastro",
  "/consulta",
  "/reproducao",
  "/vacinas",
  "/nascimentos",
  "/pesagem-ce",
  "/importar",
  "/importar/planilhas",

  // Gerenciar
  "/gerenciar",
  "/gerenciar/fazendas",
  "/gerenciar/classe",
  "/gerenciar/status",

  // Geral / Relatórios
  "/geral",
  "/geral/bois",
  "/geral/relatorios",
  "/geral/relatorios/pdf",
  "/geral/relatorios/planilhas",
];

// Dynamic route patterns and their parent fallback routes
const DYNAMIC_ROUTE_FALLBACKS: Record<string, string> = {
  "/bois/": "/bois",
  "/matrizes/": "/matrizes",
};

// Helper function to find appropriate fallback for dynamic routes
function getFallbackRoute(pathname: string): string | null {
  for (const [pattern, fallback] of Object.entries(DYNAMIC_ROUTE_FALLBACKS)) {
    if (pathname.startsWith(pattern)) {
      return fallback;
    }
  }
  return null;
}

// Cache dynamic routes in background
async function cacheDynamicRoutes(urls: string[]) {
  const cache = await caches.open(CACHE_NAME);

  for (const url of urls) {
    try {
      // Check if already cached
      const cached = await cache.match(url);
      if (!cached) {
        const response = await fetch(url);
        if (response && response.status === 200) {
          await cache.put(url, response);
          console.log(`Service Worker: Proactively cached ${url}`);
        }
      }
    } catch (error) {
      console.warn(`Service Worker: Failed to proactively cache ${url}`, error);
    }
  }
}

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

// Listen for messages from the app to proactively cache dynamic routes
self.addEventListener("message", (event: any) => {
  if (event.data && event.data.type === "CACHE_DYNAMIC_ROUTES") {
    const urls = event.data.urls as string[];
    console.log(
      `Service Worker: Received request to cache ${urls.length} dynamic routes`
    );
    event.waitUntil(cacheDynamicRoutes(urls));
  }

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event: any) => {
  // Ignore non-GET requests
  if (event.request.method !== "GET") return;

  // Ignore chrome-extension schemes
  if (event.request.url.startsWith("chrome-extension")) return;

  const url = new URL(event.request.url);

  // NAVIGATION (HTML pages) - Network-First with smart offline fallback
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
        .catch(async () => {
          // Try cache first
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // For dynamic routes, try to serve the parent page as fallback
          // This allows Next.js to handle client-side routing with RxDB data
          const fallbackRoute = getFallbackRoute(url.pathname);
          if (fallbackRoute) {
            const fallbackResponse = await caches.match(fallbackRoute);
            if (fallbackResponse) {
              console.log(
                `Service Worker: Serving fallback ${fallbackRoute} for ${url.pathname}`
              );
              return fallbackResponse;
            }
          }

          // Try root page as last SPA fallback
          const rootResponse = await caches.match("/");
          if (rootResponse) {
            return rootResponse;
          }

          // Try cached offline page
          const offlineResponse = await caches.match("/offline.html");
          if (offlineResponse) {
            return offlineResponse;
          }

          // Last resort: minimal offline response
          return new Response(
            `<!DOCTYPE html>
            <html lang="pt-BR">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Offline - INDI Ouro</title>
              <style>
                body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #1162ae; color: white; text-align: center; padding: 20px; }
                a { display: inline-block; margin-top: 20px; padding: 12px 24px; background: white; color: #1162ae; text-decoration: none; border-radius: 8px; font-weight: 600; }
              </style>
            </head>
            <body>
              <div>
                <h1>📴 Offline</h1>
                <p>Página não disponível. Conecte-se à internet.</p>
                <a href="/">Tentar novamente</a>
              </div>
            </body>
            </html>`,
            {
              status: 503,
              statusText: "Service Unavailable",
              headers: new Headers({
                "Content-Type": "text/html; charset=utf-8",
              }),
            }
          );
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

// Background Sync Configuration
const SYNC_DB_NAME = "offline-sync-queue";
const SYNC_STORE_NAME = "requests";
const MAX_RETRIES = 5;

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
  timestamp: number;
  retries: number;
}

// Open IndexedDB for sync queue
async function openSyncDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SYNC_DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SYNC_STORE_NAME)) {
        db.createObjectStore(SYNC_STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = () => {
      reject(new Error("Failed to open sync database"));
    };
  });
}

// Get all pending requests
async function getPendingRequests(): Promise<QueuedRequest[]> {
  try {
    const db = await openSyncDb();
    const transaction = db.transaction(SYNC_STORE_NAME, "readonly");
    const store = transaction.objectStore(SYNC_STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () =>
        reject(new Error("Failed to get pending requests"));
    });
  } catch (error) {
    console.warn("Service Worker: Could not access sync queue", error);
    return [];
  }
}

// Remove a request from the queue
async function removeFromQueue(id: string): Promise<void> {
  try {
    const db = await openSyncDb();
    const transaction = db.transaction(SYNC_STORE_NAME, "readwrite");
    const store = transaction.objectStore(SYNC_STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to remove ${id}`));
    });
  } catch (error) {
    console.warn("Service Worker: Could not remove from queue", error);
  }
}

// Update retry count for a request
async function updateRetryCount(item: QueuedRequest): Promise<void> {
  try {
    const db = await openSyncDb();
    const transaction = db.transaction(SYNC_STORE_NAME, "readwrite");
    const store = transaction.objectStore(SYNC_STORE_NAME);

    const updatedItem = { ...item, retries: item.retries + 1 };

    return new Promise((resolve, reject) => {
      const request = store.put(updatedItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to update ${item.id}`));
    });
  } catch (error) {
    console.warn("Service Worker: Could not update retry count", error);
  }
}

// Notify all clients about sync status
async function notifyClients(message: { type: string; data?: unknown }) {
  const clients = await self.clients.matchAll({ type: "window" });
  clients.forEach((client) => {
    client.postMessage(message);
  });
}

// Background Sync event
self.addEventListener("sync", (event: any) => {
  console.log("Service Worker: Sync event fired", event.tag);
  if (event.tag === "sync-data") {
    event.waitUntil(syncData());
  }
});

// Main sync function
async function syncData() {
  console.log("Service Worker: Executing background sync...");

  const pendingRequests = await getPendingRequests();

  if (pendingRequests.length === 0) {
    console.log("Service Worker: No pending requests to sync");
    notifyClients({ type: "SYNC_COMPLETE", data: { synced: 0 } });
    return;
  }

  console.log(
    `Service Worker: Found ${pendingRequests.length} pending requests`
  );
  notifyClients({
    type: "SYNC_STARTED",
    data: { pending: pendingRequests.length },
  });

  let successCount = 0;
  let failCount = 0;

  for (const item of pendingRequests) {
    try {
      // Skip items that have exceeded max retries
      if (item.retries >= MAX_RETRIES) {
        console.warn(
          `Service Worker: Max retries exceeded for ${item.id}, removing`
        );
        await removeFromQueue(item.id);
        failCount++;
        continue;
      }

      // Execute the request
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body ? JSON.stringify(item.body) : undefined,
      });

      if (response.ok) {
        console.log(`Service Worker: Successfully synced ${item.id}`);
        await removeFromQueue(item.id);
        successCount++;
      } else if (response.status >= 400 && response.status < 500) {
        // Client error - don't retry
        console.warn(`Service Worker: Client error for ${item.id}, removing`);
        await removeFromQueue(item.id);
        failCount++;
      } else {
        // Server error - increment retry
        console.warn(`Service Worker: Server error for ${item.id}, will retry`);
        await updateRetryCount(item);
        failCount++;
      }
    } catch (error) {
      // Network error - increment retry
      console.error(`Service Worker: Network error for ${item.id}`, error);
      await updateRetryCount(item);
      failCount++;
    }
  }

  console.log(
    `Service Worker: Sync complete. Success: ${successCount}, Failed: ${failCount}`
  );
  notifyClients({
    type: "SYNC_COMPLETE",
    data: { synced: successCount, failed: failCount, remaining: failCount },
  });
}

// Periodic sync (if supported)
self.addEventListener("periodicsync", (event: any) => {
  if (event.tag === "sync-data-periodic") {
    console.log("Service Worker: Periodic sync triggered");
    event.waitUntil(syncData());
  }
});

// Try to sync when coming back online
self.addEventListener("online", () => {
  console.log("Service Worker: Back online, triggering sync");
  syncData();
});

