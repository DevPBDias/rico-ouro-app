"use client";

import { useState, useEffect } from "react";
import { useRxDB } from "@/providers/RxDBProvider";
import { AnimalMetric } from "@/types/animal_metrics.type";

export function useAnimalWeights(rgn?: string) {
  const { db, isLoading: dbLoading } = useRxDB();
  const [weights, setWeights] = useState<AnimalMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) {
      setIsLoading(dbLoading);
      return;
    }

    setIsLoading(true);

    const query = db.animal_metrics_weight.find({
      selector: {
        _deleted: { $eq: false },
        ...(rgn ? { rgn: { $eq: rgn } } : {}),
      },
      sort: [{ date: "asc" }],
    });

    const subscription = query.$.subscribe({
      next: (docs) => {
        const data = docs.map((doc) => doc.toJSON() as AnimalMetric);
        setWeights(data);
        setIsLoading(false);
      },
      error: (err) => {
        setError(err);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [db, dbLoading, rgn]);

  return {
    weights,
    isLoading,
    error,
  };
}
