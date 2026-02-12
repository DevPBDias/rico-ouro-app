/// <reference lib="webworker" />

export type {};
declare const self: ServiceWorkerGlobalScope;

// ============================================================================
// CONFIGURAÇÃO - Versão e nomes de cache
// ============================================================================
const SCHEMA_VERSION = "v28"; // Increment for /calendario and eye-soft animation updates
const CACHE_NAME = `rico-ouro-cache-${SCHEMA_VERSION}`;
const API_CACHE_NAME = `rico-ouro-api-${SCHEMA_VERSION}`;

// ============================================================================
// APP SHELL - Assets essenciais que DEVEM estar disponíveis offline
// ============================================================================
const APP_SHELL_ASSETS = [
  // Core HTML/Manifest
  "/",
  "/manifest.json",
  "/offline.html",

  // PWA Icons
  "/logo.svg",
  "/splash.png",

  // Auth
  "/login",
  "/home",

  // Main pages (protected) - Estas servem como fallback para rotas dinâmicas
  "/animals",
  "/matrizes",
  "/cadastro",
  "/consulta",
  "/reproducao",
  "/vacinas",
  "/nascimentos",
  "/calendario",
  "/pesagem-ce",
  "/importar",
  "/importar/planilhas",

  // Gerenciar
  "/gerenciar",
  "/gerenciar/doses-semen",

  // Geral / Relatórios
  "/geral",
  "/geral/relatorios",
  "/geral/relatorios/pdf",
  "/geral/relatorios/planilhas",
];

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Tenta clonar e cachear uma resposta de forma segura
 */
async function cacheResponse(
  cacheName: string,
  request: Request,
  response: Response,
): Promise<void> {
  try {
    if (
      response &&
      response.status === 200 &&
      (response.type === "basic" || response.type === "cors")
    ) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
  } catch (error) {
    console.warn("Service Worker: Failed to cache response", error);
  }
}

/**
 * Cache proativo (chamado pelo app quando carrega listas)
 */
async function cacheUrls(urls: string[]): Promise<void> {
  const cache = await caches.open(CACHE_NAME);

  for (const url of urls) {
    try {
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

// ============================================================================
// INSTALAÇÃO - Pré-cache do App Shell
// ============================================================================
self.addEventListener("install", (event: ExtendableEvent) => {
  console.log("Service Worker: Installing v27 (App Shell)...");

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log("Service Worker: Caching App Shell");

      // Cache individual para não falhar se um asset não existir
      const cachePromises = APP_SHELL_ASSETS.map(async (url) => {
        try {
          await cache.add(url);
        } catch (error) {
          // Silent fail for missing assets
        }
      });

      await Promise.all(cachePromises);
    }),
  );

  // Ativa imediatamente sem esperar tabs fecharem
  self.skipWaiting();
});

// ============================================================================
// ATIVAÇÃO - Limpeza de caches antigos
// ============================================================================
self.addEventListener("activate", (event: ExtendableEvent) => {
  console.log("Service Worker: Activating...");

  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          // Remove caches de versões anteriores
          if (
            !key.includes(SCHEMA_VERSION) &&
            (key.startsWith("rico-ouro-cache-") ||
              key.startsWith("rico-ouro-api-") ||
              key.startsWith("rico-ouro-dynamic-"))
          ) {
            console.log("Service Worker: Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  // Toma controle de todas as abas imediatamente
  self.clients.claim();
});

// ============================================================================
// MENSAGENS DO APP
// ============================================================================
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === "CACHE_DYNAMIC_ROUTES") {
    const urls = event.data.urls as string[];
    console.log(
      `Service Worker: Received request to cache ${urls.length} routes`
    );
    event.waitUntil(cacheUrls(urls));
  }

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((keys) => {
        return Promise.all(keys.map((key) => caches.delete(key)));
      })
    );
  }
});

// ============================================================================
// FETCH - Estratégias de Cache
// ============================================================================
self.addEventListener("fetch", (event: FetchEvent) => {
  // Ignora requisições não-GET
  if (event.request.method !== "GET") return;

  // Ignora extensões do Chrome
  if (event.request.url.startsWith("chrome-extension")) return;

  const url = new URL(event.request.url);

  // -------------------------------------------------------------------------
  // 1. NEXT.JS STATIC ASSETS - Cache-First (hashed, imutáveis)
  // -------------------------------------------------------------------------
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then(async (cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            await cacheResponse(CACHE_NAME, event.request, networkResponse);
          }
          return networkResponse;
        } catch {
          return new Response("Offline", { status: 503 });
        }
      })
    );
    return;
  }

  // -------------------------------------------------------------------------
  // 2. API REQUESTS - Network-First com cache e timeout
  // -------------------------------------------------------------------------
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      (async () => {
        const NETWORK_TIMEOUT_MS = 5000; // 5 segundos

        try {
          // Tenta rede com timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(
            () => controller.abort(),
            NETWORK_TIMEOUT_MS
          );

          const networkResponse = await fetch(event.request, {
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (networkResponse && networkResponse.status === 200) {
            await cacheResponse(API_CACHE_NAME, event.request, networkResponse);
          }
          return networkResponse;
        } catch {
          // Fallback para cache
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            console.log("Service Worker: Serving API from cache", url.pathname);
            return cachedResponse;
          }

          return new Response(
            JSON.stringify({ error: "Offline", cached: false }),
            {
              status: 503,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      })()
    );
    return;
  }

  // -------------------------------------------------------------------------
  // 3. NAVEGAÇÃO (HTML) - App Shell Strategy
  // -------------------------------------------------------------------------
  if (
    event.request.mode === "navigate" ||
    event.request.headers.get("accept")?.includes("text/html")
  ) {
    event.respondWith(
      (async () => {
        const NETWORK_TIMEOUT_MS = 3000; // 3 segundos para navegação

        try {
          // Tenta rede primeiro com timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(
            () => controller.abort(),
            NETWORK_TIMEOUT_MS
          );

          const networkResponse = await fetch(event.request, {
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          // Cache a resposta para uso futuro
          if (networkResponse && networkResponse.status === 200) {
            await cacheResponse(CACHE_NAME, event.request, networkResponse);
          }

          return networkResponse;
        } catch {
          // OFFLINE - Aplica estratégia App Shell

          // 1. Tenta cache exato (se a rota foi visitada antes)
          const exactMatch = await caches.match(event.request);
          if (exactMatch) {
            console.log(
              "Service Worker: Serving from cache (exact)",
              url.pathname
            );
            return exactMatch;
          }

          // 2. Tenta a página raiz como fallback geral (App Shell)
          const rootResponse = await caches.match("/");
          if (rootResponse) {
            console.log(
              "Service Worker: Serving App Shell as fallback",
              url.pathname
            );
            return rootResponse;
          }

          // 3. Página offline estática como último recurso
          const offlineResponse = await caches.match("/offline.html");
          if (offlineResponse) {
            return offlineResponse;
          }

          // 4. Resposta inline de emergência
          return new Response(
            `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - INDI Ouro</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #1162ae 0%, #0d4d8a 100%);
      color: white;
      text-align: center;
      padding: 20px;
    }
    .container {
      max-width: 400px;
    }
    h1 { font-size: 3rem; margin-bottom: 0.5rem; }
    p { font-size: 1.1rem; opacity: 0.9; margin-bottom: 2rem; }
    a {
      display: inline-block;
      padding: 14px 28px;
      background: white;
      color: #1162ae;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: transform 0.2s;
    }
    a:hover { transform: scale(1.05); }
  </style>
</head>
<body>
  <div class="container">
    <h1>📴</h1>
    <h2>Você está offline</h2>
    <p>Esta página não está disponível no momento. Verifique sua conexão e tente novamente.</p>
    <a href="/home">Ir para Início</a>
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
        }
      })()
    );
    return;
  }

  // -------------------------------------------------------------------------
  // 4. NEXT.JS DATA (JSON) - Network-First com fallback
  // -------------------------------------------------------------------------
  if (url.pathname.includes("/_next/data/")) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            await cacheResponse(CACHE_NAME, event.request, networkResponse);
          }
          return networkResponse;
        } catch {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Retorna JSON vazio para não quebrar o app
          return new Response(JSON.stringify({ pageProps: {} }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      })()
    );
    return;
  }

  // -------------------------------------------------------------------------
  // 5. SCRIPTS JS - Network-First
  // -------------------------------------------------------------------------
  if (url.pathname.endsWith(".js")) {
    event.respondWith(
      fetch(event.request)
        .then(async (networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === "basic" ||
              networkResponse.type === "cors")
          ) {
            await cacheResponse(CACHE_NAME, event.request, networkResponse);
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          return cachedResponse || new Response("Offline", { status: 503 });
        })
    );
    return;
  }

  // -------------------------------------------------------------------------
  // 5.5 IMAGENS DO SUPABASE - Cache-First (Prioriza offline)
  // -------------------------------------------------------------------------
  if (
    url.hostname.includes("supabase.co") &&
    url.pathname.includes("/storage/")
  ) {
    event.respondWith(
      caches.match(event.request).then(async (cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            await cacheResponse(CACHE_NAME, event.request, networkResponse);
          }
          return networkResponse;
        } catch {
          return new Response("Offline", { status: 503 });
        }
      })
    );
    return;
  }

  // -------------------------------------------------------------------------
  // 6. OUTROS ASSETS (imagens, fontes, CSS) - Cache-First
  // -------------------------------------------------------------------------
  event.respondWith(
    caches.match(event.request).then(async (response) => {
      if (response) {
        return response;
      }

      try {
        const networkResponse = await fetch(event.request);
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (networkResponse.type === "basic" || networkResponse.type === "cors")
        ) {
          await cacheResponse(CACHE_NAME, event.request, networkResponse);
        }
        return networkResponse;
      } catch {
        return new Response("Offline", { status: 503 });
      }
    })
  );
});

// ============================================================================
// BACKGROUND SYNC - Fila de requisições offline
// ============================================================================
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

async function notifyClients(message: { type: string; data?: unknown }) {
  const clients = await self.clients.matchAll({ type: "window" });
  clients.forEach((client) => {
    client.postMessage(message);
  });
}

self.addEventListener("sync", (event: any) => {
  console.log("Service Worker: Sync event fired", event.tag);
  if (event.tag === "sync-data") {
    event.waitUntil(syncData());
  }
});

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
      if (item.retries >= MAX_RETRIES) {
        console.warn(
          `Service Worker: Max retries exceeded for ${item.id}, removing`
        );
        await removeFromQueue(item.id);
        failCount++;
        continue;
      }

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
        console.warn(`Service Worker: Client error for ${item.id}, removing`);
        await removeFromQueue(item.id);
        failCount++;
      } else {
        console.warn(`Service Worker: Server error for ${item.id}, will retry`);
        await updateRetryCount(item);
        failCount++;
      }
    } catch (error) {
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

// Periodic sync (se suportado pelo browser)
self.addEventListener("periodicsync", (event: any) => {
  if (event.tag === "sync-data-periodic") {
    console.log("Service Worker: Periodic sync triggered");
    event.waitUntil(syncData());
  }
});

// Tenta sincronizar quando volta online
self.addEventListener("online", () => {
  console.log("Service Worker: Back online, triggering sync");
  syncData();
});
