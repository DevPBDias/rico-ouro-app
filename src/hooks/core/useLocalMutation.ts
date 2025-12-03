"use client";

import { useRxDatabase } from "@/providers";
import { useState, useCallback } from "react";
import type { RxCollection } from "rxdb";

export function useLocalMutation<
  T extends { uuid?: string; _deleted?: boolean }
>(collectionName: string) {
  const db = useRxDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(
    async (data: Partial<T>): Promise<string> => {
      if (!db) throw new Error("Database not initialized");

      setIsLoading(true);
      setError(null);

      try {
        const collection = (db as any)[collectionName] as RxCollection<T>;
        if (!collection) {
          throw new Error(`Collection ${collectionName} not found`);
        }

        const uuid = data.uuid || crypto.randomUUID();
        const documentData = {
          ...data,
          uuid,
          updatedAt: new Date().toISOString(),
          _deleted: false,
        };

        await collection.insert(documentData as unknown as T);

        setIsLoading(false);
        return uuid;
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error("Failed to create document");
        setError(errorObj);
        setIsLoading(false);
        throw errorObj;
      }
    },
    [db, collectionName]
  );

  const update = useCallback(
    async (id: string, data: Partial<T>): Promise<void> => {
      if (!db) throw new Error("Database not initialized");

      setIsLoading(true);
      setError(null);

      try {
        const collection = (db as any)[collectionName] as RxCollection<T>;
        if (!collection) {
          throw new Error(`Collection ${collectionName} not found`);
        }

        const doc = await collection.findOne(id).exec();
        if (!doc) {
          throw new Error(`Document ${id} not found in ${collectionName}`);
        }

        const updateData = {
          ...data,
          updatedAt: new Date().toISOString(),
        };

        if (typeof (doc as any).update === "function") {
          const updateOp: any = {
            $set: updateData,
          };

          await (doc as any).update(updateOp);
        } else {
          await doc.patch(updateData);
        }

        setIsLoading(false);
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error("Failed to update document");
        setError(errorObj);
        setIsLoading(false);
        throw errorObj;
      }
    },
    [db, collectionName]
  );

  /**
   * Deletar um documento (soft delete)
   * A replicação automática irá sincronizar com Supabase
   */
  const remove = useCallback(
    async (id: string): Promise<void> => {
      if (!db) throw new Error("Database not initialized");

      setIsLoading(true);
      setError(null);

      try {
        const collection = (db as any)[collectionName] as RxCollection<T>;
        if (!collection) {
          throw new Error(`Collection ${collectionName} not found`);
        }

        const doc = await collection.findOne(id).exec();
        if (!doc) {
          throw new Error(`Document ${id} not found in ${collectionName}`);
        }

        await doc.remove();

        setIsLoading(false);
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error("Failed to remove document");
        setError(errorObj);
        setIsLoading(false);
        throw errorObj;
      }
    },
    [db, collectionName]
  );

  /**
   * Inserir múltiplos documentos de uma vez
   * A replicação automática irá sincronizar com Supabase
   */
  const bulkInsert = useCallback(
    async (documents: Partial<T>[]): Promise<void> => {
      if (!db) throw new Error("Database not initialized");

      setIsLoading(true);
      setError(null);

      try {
        const collection = (db as any)[collectionName] as RxCollection<T>;
        if (!collection) {
          throw new Error(`Collection ${collectionName} not found`);
        }

        const now = new Date().toISOString();
        const documentsWithMeta = documents.map((doc) => ({
          ...doc,
          uuid: doc.uuid || crypto.randomUUID(),
          updatedAt: now,
          _deleted: false,
        }));

        await collection.bulkInsert(documentsWithMeta as unknown as T[]);

        setIsLoading(false);
      } catch (err) {
        const errorObj =
          err instanceof Error
            ? err
            : new Error("Failed to bulk insert documents");
        setError(errorObj);
        setIsLoading(false);
        throw errorObj;
      }
    },
    [db, collectionName]
  );

  /**
   * Deletar múltiplos documentos de uma vez
   * A replicação automática irá sincronizar com Supabase
   */
  const bulkRemove = useCallback(
    async (ids: string[]): Promise<void> => {
      if (!db) throw new Error("Database not initialized");

      setIsLoading(true);
      setError(null);

      try {
        const collection = (db as any)[collectionName] as RxCollection<T>;
        if (!collection) {
          throw new Error(`Collection ${collectionName} not found`);
        }

        await collection.bulkRemove(ids);

        setIsLoading(false);
      } catch (err) {
        const errorObj =
          err instanceof Error
            ? err
            : new Error("Failed to bulk remove documents");
        setError(errorObj);
        setIsLoading(false);
        throw errorObj;
      }
    },
    [db, collectionName]
  );

  /**
   * Reset error state
   */
  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    create,
    update,
    remove,
    bulkInsert,
    bulkRemove,
    isLoading,
    error,
    reset,
  };
}
