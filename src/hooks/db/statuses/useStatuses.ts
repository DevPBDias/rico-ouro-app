"use client";

import { AnimalStatus } from "@/types/status.type";
import { useState, useEffect } from "react";
import { useRxDB } from "@/providers/RxDBProvider";

export function useStatuses() {
  const { db, isLoading: dbLoading } = useRxDB();
  const [statuses, setStatuses] = useState<AnimalStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) {
      setIsLoading(dbLoading);
      return;
    }

    setIsLoading(true);

    const subscription = db.animal_statuses
      .find({
        selector: {
          _deleted: { $eq: false },
        },
        sort: [{ status_name: "asc" }],
      })
      .$.subscribe({
        next: (docs) => {
          const data = docs.map((doc) => doc.toJSON() as AnimalStatus);
          setStatuses(data);
          setIsLoading(false);
        },
        error: (err) => {
          setError(err);
          setIsLoading(false);
        },
      });

    return () => subscription.unsubscribe();
  }, [db, dbLoading]);

  return {
    statuses,
    isLoading,
    error,
  };
}
