"use client";

import { useState, useEffect, useCallback } from "react";
import { isOnline, onOnlineStatusChange } from "@/lib/supabase/api";

export type SyncStatus =
  | "synced"
  | "syncing"
  | "offline"
  | "error"
  | "pending"
  | "checking";

interface SyncData {
  pending?: number;
  synced?: number;
  failed?: number;
  remaining?: number;
}

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>("checking");
  const [online, setOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastSyncResult, setLastSyncResult] = useState<SyncData | null>(null);

  // Handle messages from Service Worker
  const handleServiceWorkerMessage = useCallback(
    (event: MessageEvent) => {
      const { type, data } = event.data || {};

      switch (type) {
        case "SYNC_STARTED":
          setStatus("syncing");
          if (data?.pending) {
            setPendingCount(data.pending);
          }
          break;

        case "SYNC_COMPLETE":
          setLastSyncResult(data as SyncData);
          if (data?.remaining && data.remaining > 0) {
            setStatus("pending");
            setPendingCount(data.remaining);
          } else {
            setStatus(online ? "synced" : "offline");
            setPendingCount(0);
          }
          break;

        case "SYNC_ERROR":
          setStatus("error");
          break;

        default:
          break;
      }
    },
    [online]
  );

  // Get pending count from IndexedDB
  const checkPendingCount = useCallback(async () => {
    if (typeof window === "undefined") return;

    try {
      const DB_NAME = "offline-sync-queue";
      const STORE_NAME = "requests";

      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onupgradeneeded = (event) => {
          const database = (event.target as IDBOpenDBRequest).result;
          if (!database.objectStoreNames.contains(STORE_NAME)) {
            database.createObjectStore(STORE_NAME, { keyPath: "id" });
          }
        };
      });

      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);

      const count = await new Promise<number>((resolve) => {
        const countRequest = store.count();
        countRequest.onsuccess = () => resolve(countRequest.result);
        countRequest.onerror = () => resolve(0);
      });

      setPendingCount(count);
      if (count > 0 && status !== "syncing") {
        setStatus(online ? "pending" : "offline");
      }

      db.close();
    } catch (error) {
      // IndexedDB not available or other error
      console.warn("Could not check pending sync count:", error);
    }
  }, [status, online]);

  // Trigger a manual sync
  const triggerSync = useCallback(async () => {
    if (!online) return;
    if (!("serviceWorker" in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;

      if ("sync" in registration) {
        await (registration as any).sync.register("sync-data");
        setStatus("syncing");
      }
    } catch (error) {
      console.warn("Could not trigger background sync:", error);
    }
  }, [online]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Set initial online status
    const initialOnlineStatus = isOnline();
    setOnline(initialOnlineStatus);
    setStatus(initialOnlineStatus ? "synced" : "offline");

    // Check pending count on mount
    checkPendingCount();

    // Listen for online status changes
    const unsubscribe = onOnlineStatusChange((isOnlineNow) => {
      setOnline(isOnlineNow);

      if (isOnlineNow) {
        // When coming back online, trigger sync
        setStatus("syncing");
        triggerSync();
      } else {
        setStatus("offline");
      }
    });

    // Listen for Service Worker messages
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener(
        "message",
        handleServiceWorkerMessage
      );
    }

    // Periodically check pending count
    const intervalId = setInterval(checkPendingCount, 30000);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener(
          "message",
          handleServiceWorkerMessage
        );
      }
      clearInterval(intervalId);
    };
  }, [handleServiceWorkerMessage, checkPendingCount, triggerSync]);

  return {
    status,
    online,
    pendingCount,
    lastSyncResult,
    isSyncing: status === "syncing",
    isOffline: status === "offline",
    hasPending: status === "pending" || pendingCount > 0,
    hasError: status === "error",
    triggerSync,
    checkPendingCount,
  };
}
