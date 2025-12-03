"use client";

import { useRxDatabase } from "@/providers";
import { useEffect, useState, useCallback } from "react";
import type { RxDocument, RxCollection } from "rxdb";

export function useLocalDocument<T>(
  collectionName: string,
  id: string | null | undefined
) {
  const db = useRxDatabase();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    if (!db || !id) return;

    const collection = (db as any)[collectionName] as RxCollection<T>;
    if (!collection) {
      return;
    }

    collection
      .findOne(id)
      .exec()
      .then((doc: RxDocument<T> | null) => {
        setData(doc ? (doc.toJSON() as T) : null);
      })
      .catch((err: any) => {
      });
  }, [db, collectionName, id]);

  useEffect(() => {
    if (!db || !id) {
      setData(null);
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

      const subscription = collection.findOne(id).$.subscribe({
        next: (doc: RxDocument<T> | null) => {
          setData(doc ? (doc.toJSON() as T) : null);
          setIsLoading(false);
          setError(null);
        },
        error: (err: any) => {
          setError(
            err instanceof Error ? err : new Error("Document fetch error")
          );
          setIsLoading(false);
        },
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Document query error"));
      setIsLoading(false);
    }
  }, [db, collectionName, id]);

  return { data, isLoading, error, refetch };
}
