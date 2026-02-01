"use client";

import { useState, useEffect } from "react";
import { useRxDB } from "@/providers/RxDBProvider";
import { AnimalSituation } from "@/types/situation.type";
import { RxDocument } from "rxdb";

export function useSituations() {
  const { db, isLoading: dbLoading } = useRxDB();
  const [situations, setSituations] = useState<AnimalSituation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db || !db.animal_situations) {
      setIsLoading(dbLoading);
      return;
    }

    setIsLoading(true);

    const subscription = db.animal_situations
      .find({
        selector: {
          _deleted: { $eq: false },
        },
        sort: [{ situation_name: "asc" }],
      })
      .$.subscribe({
        next: (docs: RxDocument<AnimalSituation>[]) => {
          const data = docs.map((doc) => doc.toJSON() as AnimalSituation);
          setSituations(data);
          setIsLoading(false);
        },
        error: (err: Error) => {
          setError(err);
          setIsLoading(false);
        },
      });

    return () => subscription.unsubscribe();
  }, [db, dbLoading]);

  return {
    situations,
    isLoading,
    error,
  };
}
