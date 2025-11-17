import { useState, useEffect, useCallback } from 'react';
import { syncService } from '@/lib/sync-service';
import { db } from '@/lib/dexie';

export interface OfflineStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  syncError: Error | null;
  syncNow: () => Promise<void>;
  getPendingChanges: () => Promise<{
    animals: number;
    vaccines: number;
    farms: number;
    matrizes: number;
    total: number;
  }>;
}

export function useOfflineStatus(): OfflineStatus {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<Error | null>(null);

    const syncNow = useCallback(async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      await syncService.forceSync();
      setLastSync(new Date());
    } catch (error) {
      console.error('Sync error:', error);
      setSyncError(error instanceof Error ? error : new Error('Erro desconhecido'));
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      syncNow().catch(console.error);
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncNow]);

  // Sync function


  // Get pending changes count
  const getPendingChanges = useCallback(async () => {
    const [animals, vaccines, farms, matrizes] = await Promise.all([
      db.syncQueue.where('table').equals('animals').count(),
      db.syncQueue.where('table').equals('vaccines').count(),
      db.syncQueue.where('table').equals('farms').count(),
      db.syncQueue.where('table').equals('matrices').count(),
    ]);

    return {
      animals,
      vaccines,
      farms,
      matrizes,
      total: animals + vaccines + farms + matrizes,
    };
  }, []);

  return {
    isOnline,
    isSyncing,
    lastSync,
    syncError,
    syncNow,
    getPendingChanges,
  };
}
