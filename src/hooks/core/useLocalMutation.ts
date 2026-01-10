"use client";

import { useRxDatabase } from "@/providers";
import { useState, useCallback } from "react";
import type { RxCollection } from "rxdb";

export function useLocalMutation<
  T extends { updated_at?: string; _deleted?: boolean }
>(collectionName: string) {
  const db = useRxDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(
    async (data: Partial<T>): Promise<T> => {
      if (!db) throw new Error("Database not initialized");

      setIsLoading(true);
      setError(null);

      try {
        const collection = (db as any)[collectionName] as RxCollection<T>;
        if (!collection) {
          throw new Error(`Collection ${collectionName} not found`);
        }

        const documentData = {
          ...data,
          _deleted: false,
        };

        const doc = await collection.insert(documentData as unknown as T);

        setIsLoading(false);
        return doc.toJSON() as T;
      } catch (err) {
        console.error(
          `❌ [useLocalMutation] CREATE ERROR in ${collectionName}:`,
          err
        );
        const errorObj =
          err instanceof Error ? err : new Error("Failed to create document");
        setError(errorObj);
        setIsLoading(false);
        throw errorObj;
      }
    },
    [db, collectionName]
  );

  const upsert = useCallback(
    async (data: Partial<T>): Promise<T> => {
      if (!db) throw new Error("Database not initialized");

      setIsLoading(true);
      setError(null);

      try {
        const collection = (db as any)[collectionName] as RxCollection<T>;
        if (!collection) {
          throw new Error(`Collection ${collectionName} not found`);
        }

        const documentData = {
          ...data,
          _deleted: false,
        };

        const doc = await collection.upsert(documentData as unknown as T);

        setIsLoading(false);
        return doc.toJSON() as T;
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error("Failed to upsert document");
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

        await doc.patch({
          _deleted: true,
          updated_at: new Date().toISOString(),
        } as any);

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

        const documentsWithMeta = documents.map((doc) => ({
          ...doc,
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

        const primaryKey =
          (collection as any).schema.jsonSchema.primaryKey || "id";
        const query = collection.find({
          selector: {
            [primaryKey]: { $in: ids },
          } as any,
        });
        const docs = await query.exec();
        await Promise.all(
          docs.map((doc: any) =>
            doc.patch({
              _deleted: true,
              updated_at: new Date().toISOString(),
            } as any)
          )
        );

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
    upsert,
    update,
    remove,
    bulkInsert,
    bulkRemove,
    isLoading,
    error,
    reset,
  };
}
