"use client";

import { useState, useEffect, useCallback } from "react";
import { useRxDatabase } from "@/providers/RxDBProvider";

interface PendingChanges {
  total: number;
  animals: number;
  vaccines: number;
  farms: number;
  matrizes: number;
}

export function useOfflineStatus() {
  const db = useRxDatabase();
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Get pending changes from all collections
  const getPendingChanges = useCallback(async (): Promise<PendingChanges> => {
    if (!db) {
      return { total: 0, animals: 0, vaccines: 0, farms: 0, matrizes: 0 };
    }

    try {
      // Count documents that haven't been synced yet (have _deleted or modified flags)
      const animalsCount =
        (await db.animals
          ?.find({
            selector: {
              $or: [{ _deleted: true }, { _modified: { $exists: true } }],
            },
          })
          .exec()
          .then((docs: unknown[]) => docs?.length || 0)) || 0;

      const vaccinesCount =
        (await db.vaccines
          ?.find({
            selector: {
              $or: [{ _deleted: true }, { _modified: { $exists: true } }],
            },
          })
          .exec()
          .then((docs: unknown[]) => docs?.length || 0)) || 0;

      const farmsCount =
        (await db.farms
          ?.find({
            selector: {
              $or: [{ _deleted: true }, { _modified: { $exists: true } }],
            },
          })
          .exec()
          .then((docs: unknown[]) => docs?.length || 0)) || 0;

      const matrizesCount =
        (await db.matriz
          ?.find({
            selector: {
              $or: [{ _deleted: true }, { _modified: { $exists: true } }],
            },
          })
          .exec()
          .then((docs: unknown[]) => docs?.length || 0)) || 0;

      const total = animalsCount + vaccinesCount + farmsCount + matrizesCount;

      return {
        total,
        animals: animalsCount,
        vaccines: vaccinesCount,
        farms: farmsCount,
        matrizes: matrizesCount,
      };
    } catch (error) {
      console.error("Error getting pending changes:", error);
      return { total: 0, animals: 0, vaccines: 0, farms: 0, matrizes: 0 };
    }
  }, [db]);

  // Manually trigger sync
  const syncNow = useCallback(async () => {
    if (!isOnline || isSyncing || !db) {
      return;
    }

    try {
      setIsSyncing(true);

      // Trigger replication for all collections
      // Note: This assumes you have replication set up in your database
      // You may need to adjust this based on your actual sync implementation

      // For now, we'll just simulate a sync
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLastSync(new Date());
    } catch (error) {
      console.error("Error syncing:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, db]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && !isSyncing) {
      syncNow();
    }
  }, [isOnline, syncNow, isSyncing]);

  return {
    isOnline,
    isSyncing,
    lastSync,
    syncNow,
    getPendingChanges,
  };
}
