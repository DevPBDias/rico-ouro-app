"use client";

import { useState, useEffect } from "react";
import { useRxDB } from "@/providers/RxDBProvider";
import { AnimalMetric } from "@/types/animal_metrics.type";

export function useAnimalCE(rgn?: string) {
  const { db, isLoading: dbLoading } = useRxDB();
  const [ceMetrics, setCeMetrics] = useState<AnimalMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) {
      setIsLoading(dbLoading);
      return;
    }

    setIsLoading(true);

    const query = db.animal_metrics_ce.find({
      selector: {
        _deleted: { $eq: false },
        ...(rgn ? { rgn: { $eq: rgn } } : {}),
      },
      sort: [{ date: "desc" }],
    });

    const subscription = query.$.subscribe({
      next: (docs) => {
        const data = docs.map((doc) => doc.toJSON() as AnimalMetric);
        setCeMetrics(data);
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
    metrics: ceMetrics,
    isLoading,
    error,
  };
}
