"use client";

import { useState, useEffect } from "react";
import { useRxDB } from "@/providers/RxDBProvider";
import { SemenDose } from "@/types/semen_dose.type";

export function useSemenDoses() {
  const { db, isLoading: dbLoading } = useRxDB();
  const [doses, setDoses] = useState<SemenDose[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) {
      setIsLoading(dbLoading);
      return;
    }

    setIsLoading(true);

    const subscription = db.semen_doses
      .find({
        selector: {
          _deleted: { $eq: false },
        },
        sort: [{ updated_at: "desc" }],
      })
      .$.subscribe({
        next: (docs) => {
          const data = docs.map((doc) => doc.toJSON() as SemenDose);
          setDoses(data);
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
    doses,
    isLoading,
    error,
  };
}
