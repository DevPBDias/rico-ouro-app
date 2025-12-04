"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRxDBContext } from "@/providers/RxDBProvider";
import { useReplication } from "@/providers/ReplicationProvider";
import { MyDatabaseCollections } from "@/db/collections";

export function useLocalFirst() {
  const { db, isLoading, error } = useRxDBContext();
  const { isSyncing, lastSyncedAt, online, replicationErrors } =
    useReplication();
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    if (!db) return;

    const collections = Object.values(db.collections);
    const queries = collections.map(
      (col: any) => col.count({ selector: { isSynced: { $eq: false } } }).$
    );

    const subscription = import("rxjs").then(({ combineLatest }) => {
      const sub = combineLatest(queries).subscribe((counts: any[]) => {
        const total = counts.reduce((acc, count) => acc + count, 0);
        setQueueSize(total);
      });
      return sub;
    });

    return () => {
      subscription.then((sub) => sub.unsubscribe());
    };
  }, [db]);

  const collections = useMemo(() => {
    if (!db) return null;
    return db.collections as MyDatabaseCollections;
  }, [db]);

  const forceSync = useCallback(async () => {
    if (!db) {
      return;
    }

    try {
    } catch (err) {
    }
  }, [db]);

  const clearLocalDatabase = useCallback(async () => {
    if (!db) {
      return;
    }

    try {
      const collections = Object.values(db.collections);

      for (const collection of collections) {
        const docs = await (collection as any).find().exec();
        const ids = docs.map((doc: any) => doc.primary);
        await (collection as any).bulkRemove(ids);
      }
    } catch (err) {
      throw err;
    }
  }, [db]);

  const getSyncStats = useCallback(() => {
    return {
      queueSize,
      isSyncing,
      lastSyncedAt,
      online,
      hasErrors: replicationErrors.length > 0,
      errorCount: replicationErrors.length,
    };
  }, [queueSize, isSyncing, lastSyncedAt, online, replicationErrors]);

  const isCollectionSyncing = useCallback(
    (collectionName: string) => {
      if (!db || !db.replications) return false;

      const replication = (db.replications as any)[collectionName];
      return replication?.active$ || false;
    },
    [db]
  );

  return {
    db,
    collections,
    loading: isLoading,
    error,
    syncing: isSyncing,
    online,
    lastSyncedAt,
    queueSize,
    replicationErrors,
    forceSync,
    clearLocalDatabase,
    getSyncStats,
    isCollectionSyncing,
  };
}

export function useCollections() {
  const { collections } = useLocalFirst();
  return collections;
}

export function useSyncStatus() {
  const { syncing, online, queueSize, lastSyncedAt, replicationErrors } =
    useLocalFirst();

  return {
    isSyncing: syncing,
    isOnline: online,
    pendingChanges: queueSize,
    lastSynced: lastSyncedAt,
    hasErrors: replicationErrors.length > 0,
    errors: replicationErrors,
  };
}
