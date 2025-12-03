"use client";

import { useRxDatabase } from "@/providers";
import { useState, useEffect, useCallback } from "react";

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

  const getPendingChanges = useCallback(async (): Promise<PendingChanges> => {
    if (!db) {
      return { total: 0, animals: 0, vaccines: 0, farms: 0, matrizes: 0 };
    }

    try {
      const animalsCount =
        (await db.animals
          ?.find({
            selector: {
              $or: [{ _deleted: true }, { updatedAt: { $exists: true } }],
            },
          })
          .exec()
          .then((docs: unknown[]) => docs?.length || 0)) || 0;

      const vaccinesCount =
        (await db.vaccines
          ?.find({
            selector: {
              $or: [{ _deleted: true }, { updatedAt: { $exists: true } }],
            },
          })
          .exec()
          .then((docs: unknown[]) => docs?.length || 0)) || 0;

      const farmsCount =
        (await db.farms
          ?.find({
            selector: {
              $or: [{ _deleted: true }, { updatedAt: { $exists: true } }],
            },
          })
          .exec()
          .then((docs: unknown[]) => docs?.length || 0)) || 0;

      const matrizesCount =
        (await db.matriz
          ?.find({
            selector: {
              $or: [{ _deleted: true }, { updatedAt: { $exists: true } }],
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
      return { total: 0, animals: 0, vaccines: 0, farms: 0, matrizes: 0 };
    }
  }, [db]);

  const syncNow = useCallback(async () => {
    if (!isOnline || isSyncing || !db) {
      return;
    }

    try {
      setIsSyncing(true);


      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLastSync(new Date());
    } catch (error) {
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, db]);

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
