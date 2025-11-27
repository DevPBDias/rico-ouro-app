"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRxDBContext } from "@/providers/RxDBProvider";
import { useReplication } from "@/providers/ReplicationProvider";
import { MyDatabaseCollections } from "@/db/collections";

/**
 * Hook principal para acesso à infraestrutura local-first
 *
 * Fornece acesso a:
 * - Database instance
 * - Collections
 * - Estado de sincronização
 * - Status online/offline
 * - Queue de documentos não sincronizados
 *
 * @returns Estado completo do sistema local-first
 *
 * @example
 * const { db, collections, ready, syncing, online, queueSize } = useLocalFirst();
 *
 * if (!ready) return <Loading />;
 *
 * const animals = await collections.animals.find().exec();
 */
export function useLocalFirst() {
  const { db, isReady, isLoading, error } = useRxDBContext();
  const { isSyncing, lastSyncedAt, online, replicationErrors } =
    useReplication();
  const [queueSize, setQueueSize] = useState(0);

  // Calculate queue size (unsynced documents)
  useEffect(() => {
    if (!db || !isReady) return;

    const collections = Object.values(db.collections);
    const queries = collections.map(
      (col: any) => col.count({ selector: { isSynced: { $eq: false } } }).$
    );

    // Subscribe to all count queries
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
  }, [db, isReady]);

  // Typed collections
  const collections = useMemo(() => {
    if (!db) return null;
    return db.collections as MyDatabaseCollections;
  }, [db]);

  // Helper: Force sync all collections
  const forceSync = useCallback(async () => {
    if (!db || !isReady) {
      console.warn("Database not ready for sync");
      return;
    }

    try {
      // Trigger replication manually if needed
      // Most cases RxDB handles this automatically
      console.log("Manual sync triggered");

      // You can add custom logic here if needed
      // For example, calling specific replication methods
    } catch (err) {
      console.error("Error forcing sync:", err);
    }
  }, [db, isReady]);

  // Helper: Clear local database (careful!)
  const clearLocalDatabase = useCallback(async () => {
    if (!db) {
      console.warn("Database not initialized");
      return;
    }

    try {
      const collections = Object.values(db.collections);

      for (const collection of collections) {
        const docs = await (collection as any).find().exec();
        const ids = docs.map((doc: any) => doc.primary);
        await (collection as any).bulkRemove(ids);
      }

      console.log("Local database cleared");
    } catch (err) {
      console.error("Error clearing database:", err);
      throw err;
    }
  }, [db]);

  // Helper: Get sync statistics
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

  // Helper: Check if a specific collection is syncing
  const isCollectionSyncing = useCallback(
    (collectionName: string) => {
      if (!db || !db.replications) return false;

      const replication = (db.replications as any)[collectionName];
      return replication?.active$ || false;
    },
    [db]
  );

  return {
    // Database
    db,
    collections,

    // Status
    ready: isReady,
    loading: isLoading,
    error,

    // Sync Status
    syncing: isSyncing,
    online,
    lastSyncedAt,
    queueSize,
    replicationErrors,

    // Helpers
    forceSync,
    clearLocalDatabase,
    getSyncStats,
    isCollectionSyncing,
  };
}

/**
 * Hook para verificar se o sistema está pronto para uso
 *
 * @returns true se o banco está pronto
 */
export function useIsLocalFirstReady() {
  const { ready } = useLocalFirst();
  return ready;
}

/**
 * Hook para obter apenas as collections
 *
 * @returns Collections tipadas
 */
export function useCollections() {
  const { collections } = useLocalFirst();
  return collections;
}

/**
 * Hook para obter status de sincronização
 *
 * @returns Status de sync
 */
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
