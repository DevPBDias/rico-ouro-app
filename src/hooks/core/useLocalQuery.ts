"use client";

import { useRxDatabase } from "@/providers";
import { useEffect, useState, useCallback } from "react";
import type { RxDocument, MangoQuery, RxCollection } from "rxdb";

export function useLocalQuery<T>(
  collectionName: string,
  query?: MangoQuery<T> | null
) {
  const db = useRxDatabase();
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    if (!db || !query) return;

    const collection = (db as any)[collectionName] as RxCollection<T>;
    if (!collection) {
      return;
    }

    collection
      .find(query)
      .exec()
      .then((results: RxDocument<T>[]) => {
        setData(results.map((doc) => doc.toJSON() as T));
      })
      .catch((err: any) => {});
  }, [db, collectionName, query]);

  useEffect(() => {
    if (!db) {
      setData([]);
      setIsLoading(false);
      return;
    }

    if (!query) {
      setData([]);
      setIsLoading(false);
      return;
    }

    const collection = (db as any)[collectionName] as RxCollection<T>;
    if (!collection) {
      setError(new Error(`Collection ${collectionName} not found`));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const rxQuery = collection.find(query);

      const subscription = rxQuery.$.subscribe({
        next: (results: RxDocument<T>[]) => {
          setData(results.map((doc) => doc.toJSON() as T));
          setIsLoading(false);
          setError(null);
        },
        error: (err: any) => {
          setError(
            err instanceof Error ? err : new Error("Query subscription error")
          );
          setIsLoading(false);
        },
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Query creation error"));
      setIsLoading(false);
    }
  }, [db, collectionName, JSON.stringify(query)]);

  return { data, isLoading, error, refetch };
}
