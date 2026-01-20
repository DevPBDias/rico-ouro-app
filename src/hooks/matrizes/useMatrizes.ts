"use client";

import { useState, useEffect } from "react";
import { useRxDB } from "@/providers/RxDBProvider";
import { Animal } from "@/types/animal.type";
import { isMatriz } from "@/utils/animalUtils";

export function useMatrizes() {
  const { db, isLoading: dbLoading } = useRxDB();
  const [matrizes, setMatrizes] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) {
      setIsLoading(dbLoading);
      return;
    }

    setIsLoading(true);

    // Buscar todas as fêmeas não deletadas
    const subscription = db.animals
      .find({
        selector: {
          sex: { $eq: "F" },
          _deleted: { $eq: false },
        },
        sort: [{ serie_rgd: "asc" }, { rgn: "asc" }],
      })
      .$.subscribe({
        next: (docs) => {
          const allFemales = docs.map((doc) => doc.toJSON() as Animal);
          // Filtrar apenas as que têm 20+ meses
          const matrizesData = allFemales.filter(isMatriz);
          setMatrizes(matrizesData);
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
    matrizes,
    isLoading,
    error,
  };
}
