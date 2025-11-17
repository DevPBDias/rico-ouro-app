import { useState, useCallback } from 'react';
import { syncService } from '@/lib/sync-service';
import { db } from '@/lib/dexie';
type EntityType = 'animals' | 'vaccines' | 'farms' | 'matrices';

type Operation = 'create' | 'update' | 'delete';

interface OfflineCrudOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  syncAfterOperation?: boolean;
}

export function useOfflineCrud<T extends { _id?: string }>(entityType: EntityType) {
  const [isLoading, setIsLoading] = useState<Record<Operation, boolean>>({
    create: false,
    update: false,
    delete: false,
  });

  const [error, setError] = useState<Error | null>(null);

  // Helper to update loading state
  const setLoading = (operation: Operation, loading: boolean) => {
    setIsLoading(prev => ({
      ...prev,
      [operation]: loading,
    }));
  };

  // Create a new entity
  const create = useCallback(async (
    data: Omit<T, '_id' | '_rev' | '_dirty' | '_lastSynced'>,
    options: OfflineCrudOptions<T> = {}
  ): Promise<string | undefined> => {
    const { onSuccess, onError, syncAfterOperation = true } = options;
    setLoading('create', true);
    setError(null);

    try {
      // Generate a temporary ID for offline use
      const tempId = `temp_${Date.now()}`;
      const now = new Date().toISOString();
      
      // Create the entity with offline metadata
      const entity = {
        ...data,
        _id: tempId,
        _rev: now,
        _dirty: true,
        _lastSynced: null,
        created_at: now,
        updated_at: now,
      } as unknown as T;

      // Add to IndexedDB
      await (db as unknown as Record<EntityType, { add: (e: unknown) => Promise<unknown> }>)[entityType].add(entity as unknown);
      
      // Trigger sync if online
      if (syncAfterOperation) {
        syncService.forceSync().catch(console.error);
      }

      // Call success callback
      onSuccess?.(entity);
      return tempId;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create entity');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading('create', false);
    }
  }, [entityType]);

  // Update an existing entity
  const update = useCallback(async (
    id: string,
    updates: Partial<Omit<T, '_id' | '_rev' | '_dirty' | '_lastSynced'>>,
    options: OfflineCrudOptions<T> = {}
  ): Promise<void> => {
    const { onSuccess, onError, syncAfterOperation = true } = options;
    setLoading('update', true);
    setError(null);

    try {
      const now = new Date().toISOString();
      
      // Get current entity to preserve existing fields
      const current = await (db as unknown as Record<EntityType, { get: (id: unknown) => Promise<unknown> }>)[entityType].get(id);
      if (!current) {
        throw new Error('Entity not found');
      }

      // Update the entity
      const updatedEntity = {
        ...current,
        ...updates,
        _rev: now,
        _dirty: true,
        updated_at: now,
      };

      // Update in IndexedDB
      await (db as unknown as Record<EntityType, { update: (id: unknown, e: unknown) => Promise<void> }>)[entityType].update(id, updatedEntity as unknown);
      
      // Trigger sync if online
      if (syncAfterOperation) {
        syncService.forceSync().catch(console.error);
      }

      // Call success callback
      onSuccess?.(updatedEntity as unknown as T);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update entity');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading('update', false);
    }
  }, [entityType]);

  // Delete an entity
  const remove = useCallback(async (
    id: string,
    options: OfflineCrudOptions<T> = {}
  ): Promise<void> => {
    const { onSuccess, onError, syncAfterOperation = true } = options;
    setLoading('delete', true);
    setError(null);

    try {
      // Mark as deleted instead of actually deleting
      await (db as unknown as Record<EntityType, { update: (id: unknown, e: unknown) => Promise<void> }>)[entityType].update(id, {
        _dirty: true,
        _deleted: true,
        _rev: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      // Trigger sync if online
      if (syncAfterOperation) {
        syncService.forceSync().catch(console.error);
      }

      // Call success callback
      onSuccess?.({} as T);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete entity');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading('delete', false);
    }
  }, [entityType]);

  // Get a single entity by ID
  const getOne = useCallback(async (id: string): Promise<T | undefined> => {
    try {
      return await (db as unknown as Record<EntityType, { get: (id: unknown) => Promise<unknown> }>)[entityType].get(id) as unknown as T;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch entity');
      setError(error);
      throw error;
    }
  }, [entityType]);

  // Get all entities with optional filtering
  const getAll = useCallback(async (options: {
    includeDeleted?: boolean;
    filter?: (item: T) => boolean;
  } = {}): Promise<T[]> => {
    const { includeDeleted = false, filter } = options;
    
    try {
      let query = (db as unknown as Record<EntityType, { toCollection: () => { filter: (fn: (item: unknown) => boolean) => unknown; toArray: () => Promise<unknown[]> } }>)[entityType].toCollection();
      
      if (!includeDeleted) {
        query = (query as { filter: (fn: (item: unknown) => boolean) => { filter: (fn: (item: unknown) => boolean) => unknown; toArray: () => Promise<unknown[]> } }).filter((item: unknown) => !(item as { _deleted?: boolean })._deleted);
      }
      
      const items = await query.toArray();
      
      if (filter) {
        return (items as T[]).filter(filter);
      }
      
      return items as unknown as T[];
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch entities');
      setError(error);
      throw error;
    }
  }, [entityType]);

  return {
    create,
    update,
    remove,
    getOne,
    getAll,
    isLoading,
    error,
  };
}
