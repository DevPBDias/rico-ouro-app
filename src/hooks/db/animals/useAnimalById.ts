"use client";

import { useState, useEffect } from "react";
import { useRxDB } from "@/providers/RxDBProvider";
import { Animal } from "@/types/animal.type";

export function useAnimalById(rgn: string | null) {
  const { db, isLoading: dbLoading } = useRxDB();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db || !rgn) {
      setIsLoading(dbLoading);
      return;
    }

    setIsLoading(true);

    const query = db.animals.findOne({
      selector: {
        rgn: { $eq: rgn },
        _deleted: { $eq: false },
      },
    });

    const subscription = query.$.subscribe({
      next: (doc) => {
        if (doc) {
          setAnimal(doc.toJSON() as Animal);
        } else {
          setAnimal(null);
        }
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
    animal,
    isLoading,
    error,
  };
}
