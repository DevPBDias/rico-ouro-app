"use client";

import { useState, useEffect } from "react";
import { useRxDB } from "@/providers/RxDBProvider";
import { AnimalVaccine } from "@/types/vaccine.type";

export function useAnimalVaccines(rgn?: string) {
  const { db, isLoading: dbLoading } = useRxDB();
  const [animalVaccines, setAnimalVaccines] = useState<AnimalVaccine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) {
      setIsLoading(dbLoading);
      return;
    }

    setIsLoading(true);

    const query = db.animal_vaccines.find({
      selector: {
        _deleted: { $eq: false },
        ...(rgn ? { rgn: { $eq: rgn } } : {}),
      },
      sort: [{ date: "desc" }],
    });

    const subscription = query.$.subscribe({
      next: (docs) => {
        const data = docs.map((doc) => doc.toJSON() as AnimalVaccine);
        setAnimalVaccines(data);
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
    animalVaccines,
    isLoading,
    error,
  };
}
