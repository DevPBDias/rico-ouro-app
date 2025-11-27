interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
  timestamp: number;
  retries: number;
}

const DB_NAME = "offline-sync-queue";
const STORE_NAME = "requests";

async function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject(
        new Error(
          `IndexedDB error: ${(event.target as IDBOpenDBRequest).error}`
        )
      );
    };
  });
}

export async function addToSyncQueue(
  request: Omit<QueuedRequest, "id" | "timestamp" | "retries">
): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  const queuedRequest: QueuedRequest = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    retries: 0,
    ...request,
  };

  await new Promise<void>((resolve, reject) => {
    const req = store.add(queuedRequest);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(new Error("Failed to add request to queue."));
  });

  console.log("Request added to sync queue:", queuedRequest);

  // Register sync tag
  await registerBackgroundSync("sync-data");
}

export const enqueueRequest = addToSyncQueue;

export async function getSyncQueue(): Promise<QueuedRequest[]> {
  const db = await openDb();
  const transaction = db.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Failed to get sync queue."));
  });
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  await new Promise<void>((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(new Error(`Failed to remove request ${id} from queue.`));
  });

  console.log("Request removed from sync queue:", id);
}

export async function registerBackgroundSync(tag: string) {
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    const registration = await navigator.serviceWorker.ready;
    try {
      await (registration as any).sync.register(tag);
      console.log(`Background Sync registered: ${tag}`);
    } catch (err) {
      console.error("Background Sync registration failed:", err);
    }
  } else {
    console.log("Background Sync not supported");
  }
}
