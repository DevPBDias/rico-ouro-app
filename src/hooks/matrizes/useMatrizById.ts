"use client";

import { useState, useEffect } from "react";
import { useRxDB } from "@/providers/RxDBProvider";
import { Animal } from "@/types/animal.type";

export function useMatrizById(rgn: string | null) {
  const { db, isLoading: dbLoading } = useRxDB();
  const [matriz, setMatriz] = useState<Animal | null>(null);
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
        sex: { $eq: "F" }, // Apenas fêmeas
        _deleted: { $eq: false },
      },
    });

    const subscription = query.$.subscribe({
      next: (doc) => {
        if (doc) {
          setMatriz(doc.toJSON() as Animal);
        } else {
          setMatriz(null);
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
    matriz,
    isLoading,
    error,
  };
}
