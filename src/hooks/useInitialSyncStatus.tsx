"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { useRxDBContext } from "@/providers";

interface SyncProgress {
  animals: boolean;
  vaccines: boolean;
  farms: boolean;
  matriz: boolean;
}

interface CollectionCounts {
  animals: number;
  vaccines: number;
  farms: number;
  matriz: number;
}

export function useInitialSyncStatus() {
  const { db, error: dbError } = useRxDBContext();
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    animals: false,
    vaccines: false,
    farms: false,
    matriz: false,
  });
  const [counts, setCounts] = useState<CollectionCounts>({
    animals: 0,
    vaccines: 0,
    farms: 0,
    matriz: 0,
  });
  const [totalRemoteCounts, setTotalRemoteCounts] = useState<CollectionCounts>({
    animals: 0,
    vaccines: 0,
    farms: 0,
    matriz: 0,
  });
  const [isComplete, setIsComplete] = useState(false);
  const [isLoadingRemote, setIsLoadingRemote] = useState(true);
  const [hasShownNotification, setHasShownNotification] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sync-notification-shown") === "true";
    }
    return false;
  });

  useEffect(() => {
    if (dbError) {
      setIsComplete(true);
    }
  }, [dbError]);

  useEffect(() => {
    const fetchRemoteCounts = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        setIsLoadingRemote(false);
        return;
      }

      const supabase = getSupabase();

      try {
        const [animals, vaccines, farms, matriz] = await Promise.all([
          supabase.from("animals").select("*", { count: "exact", head: true }),
          supabase.from("vaccines").select("*", { count: "exact", head: true }),
          supabase.from("farms").select("*", { count: "exact", head: true }),
          supabase.from("matriz").select("*", { count: "exact", head: true }),
        ]);

        setTotalRemoteCounts({
          animals: animals.count || 0,
          vaccines: vaccines.count || 0,
          farms: farms.count || 0,
          matriz: matriz.count || 0,
        });
      } catch (error) {
      } finally {
        setIsLoadingRemote(false);
      }
    };

    fetchRemoteCounts();
  }, []);

  const updateCounts = useCallback(async () => {
    if (!db) return;

    try {
      const [animalsCount, vaccinesCount, farmsCount, matrizCount] =
        await Promise.all([
          db.animals?.count().exec() || 0,
          db.vaccines?.count().exec() || 0,
          db.farms?.count().exec() || 0,
          db.matriz?.count().exec() || 0,
        ]);

      setCounts({
        animals: animalsCount,
        vaccines: vaccinesCount,
        farms: farmsCount,
        matriz: matrizCount,
      });

      if (animalsCount > 0)
        setSyncProgress((prev) => ({ ...prev, animals: true }));
      if (vaccinesCount > 0)
        setSyncProgress((prev) => ({ ...prev, vaccines: true }));
      if (farmsCount > 0) setSyncProgress((prev) => ({ ...prev, farms: true }));
      if (matrizCount > 0)
        setSyncProgress((prev) => ({ ...prev, matriz: true }));
    } catch (error) {
    }
  }, [db]);

  useEffect(() => {
    if (!db) return;

    updateCounts();

    const interval = setInterval(() => {
      if (!isComplete) {
        updateCounts();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [db, updateCounts, isComplete]);

  useEffect(() => {
    if (!db) return;

    const replications = (db as any).replications;
    if (!replications) return;

    const subscriptions: any[] = [];

    Object.entries(replications).forEach(
      ([collectionName, replication]: [string, any]) => {
        if (!replication) return;

        const activeSub = replication.active$.subscribe((active: boolean) => {
          if (!active) {
            setSyncProgress((prev) => ({
              ...prev,
              [collectionName]: true,
            }));
          }
        });

        subscriptions.push(activeSub);
      }
    );

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [db]);

  useEffect(() => {
    if (isLoadingRemote) return;

    const allSynced = Object.values(syncProgress).every((synced) => synced);

    const dataFullyLoaded =
      counts.animals >= totalRemoteCounts.animals &&
      counts.vaccines >= totalRemoteCounts.vaccines &&
      counts.farms >= totalRemoteCounts.farms &&
      counts.matriz >= totalRemoteCounts.matriz;

    if ((allSynced && counts.animals > 0) || dataFullyLoaded) {
      if (!isComplete) {
        setIsComplete(true);
      }
    }
  }, [syncProgress, counts, totalRemoteCounts, isLoadingRemote, isComplete]);

  const markAsShown = useCallback(() => {
    setHasShownNotification(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("sync-notification-shown", "true");
    }
  }, []);

  const totalLocal = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalRemote = Object.values(totalRemoteCounts).reduce(
    (a, b) => a + b,
    0
  );
  const progressPercentage =
    totalRemote > 0
      ? Math.min(100, Math.round((totalLocal / totalRemote) * 100))
      : 0;

  return {
    syncProgress,
    counts,
    totalRemoteCounts,
    isComplete,
    isLoadingRemote,
    progressPercentage,
    hasShownNotification,
    markAsShown,
    dbError, // Exportar o erro para a UI
  };
}
