"use client";

import { useRxDatabase } from "@/providers";
import { useState, useEffect, useCallback } from "react";

interface PendingChanges {
  total: number;
  animals: number;
  vaccines: number;
  farms: number;
  animalVaccines: number;
  metricsWeight: number;
  metricsCE: number;
  reproductionEvents: number;
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
      return {
        total: 0,
        animals: 0,
        vaccines: 0,
        farms: 0,
        animalVaccines: 0,
        metricsWeight: 0,
        metricsCE: 0,
        reproductionEvents: 0,
      };
    }

    try {
      const animalsCount =
        (await db.animals
          ?.find({
            selector: {
              $or: [{ _deleted: true }, { updated_at: { $exists: true } }],
            },
          })
          .exec()
          .then((docs: unknown[]) => docs?.length || 0)) || 0;

      const vaccinesCount =
        (await db.vaccines
          ?.find({
            selector: {
              $or: [{ _deleted: true }, { updated_at: { $exists: true } }],
            },
          })
          .exec()
          .then((docs: unknown[]) => docs?.length || 0)) || 0;

      const farmsCount =
        (await db.farms
          ?.find({
            selector: {
              $or: [{ _deleted: true }, { updated_at: { $exists: true } }],
            },
          })
          .exec()
          .then((docs: unknown[]) => docs?.length || 0)) || 0;

      const animalVaccinesCount =
        (await db.animal_vaccines
          ?.find({
            selector: {
              $or: [{ _deleted: true }, { updated_at: { $exists: true } }],
            },
          })
          .exec()
          .then((docs: unknown[]) => docs?.length || 0)) || 0;

      const metricsWeightCount =
        (await db.animal_metrics_weight
          ?.find({
            selector: {
              $or: [{ _deleted: true }, { updated_at: { $exists: true } }],
            },
          })
          .exec()
          .then((docs: unknown[]) => docs?.length || 0)) || 0;

      const metricsCECount =
        (await db.animal_metrics_ce
          ?.find({
            selector: {
              $or: [{ _deleted: true }, { updated_at: { $exists: true } }],
            },
          })
          .exec()
          .then((docs: unknown[]) => docs?.length || 0)) || 0;

      const reproductionEventsCount =
        (await db.reproduction_events
          ?.find({
            selector: {
              $or: [{ _deleted: true }, { updated_at: { $exists: true } }],
            },
          })
          .exec()
          .then((docs: unknown[]) => docs?.length || 0)) || 0;

      const total =
        animalsCount +
        vaccinesCount +
        farmsCount +
        animalVaccinesCount +
        metricsWeightCount +
        metricsCECount +
        reproductionEventsCount;

      return {
        total,
        animals: animalsCount,
        vaccines: vaccinesCount,
        farms: farmsCount,
        animalVaccines: animalVaccinesCount,
        metricsWeight: metricsWeightCount,
        metricsCE: metricsCECount,
        reproductionEvents: reproductionEventsCount,
      };
    } catch (error) {
      return {
        total: 0,
        animals: 0,
        vaccines: 0,
        farms: 0,
        animalVaccines: 0,
        metricsWeight: 0,
        metricsCE: 0,
        reproductionEvents: 0,
      };
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
