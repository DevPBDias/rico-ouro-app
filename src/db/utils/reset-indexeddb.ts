/**
 * 🔥 RESET ROBUSTO DO INDEXEDDB
 *
 * Este utilitário garante a remoção completa de um banco IndexedDB,
 * incluindo tratamento de bloqueios, limpeza de cache e fallbacks.
 */

export interface ResetOptions {
  dbName: string;
  timeout?: number;
  clearLocalStorage?: boolean;
  clearSessionStorage?: boolean;
  invalidateSWCache?: boolean;
}

export async function resetIndexedDB(options: ResetOptions): Promise<void> {
  const {
    dbName,
    timeout = 5000,
    clearLocalStorage = true,
    clearSessionStorage = true,
    invalidateSWCache = true,
  } = options;
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }

    const req = indexedDB.open(dbName);
    req.onsuccess = () => {
      req.result.close();
    };

    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(dbName);

      const timer = setTimeout(() => {
        reject(new Error("Timeout ao deletar banco"));
      }, timeout);

      request.onsuccess = () => {
        clearTimeout(timer);
        resolve();
      };

      request.onerror = () => {
        clearTimeout(timer);
        reject(request.error);
      };

      request.onblocked = () => {
      };
    });

    if (clearLocalStorage) {
      Object.keys(localStorage).forEach((key) => {
        if (key.includes(dbName)) localStorage.removeItem(key);
      });
    }

    if (clearSessionStorage) {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.includes(dbName)) sessionStorage.removeItem(key);
      });
    }

    if (invalidateSWCache && "caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch (error) {
    if (clearLocalStorage) localStorage.clear();
  }
}
