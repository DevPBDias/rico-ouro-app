"use client";

import { useState, useEffect } from "react";
import { useRxDB } from "@/providers/RxDBProvider";
import { Animal } from "@/types/animal.type";

// Função para calcular idade em meses
function calculateAgeInMonths(bornDate?: string): number {
  if (!bornDate) return 0;
  
  const today = new Date();
  const birth = new Date(bornDate);
  
  const months = (today.getFullYear() - birth.getFullYear()) * 12 + 
                 (today.getMonth() - birth.getMonth());
  
  return months;
}

// Função para verificar se um animal é matriz (fêmea com 25+ meses)
function isMatriz(animal: Animal): boolean {
  if (animal.sex !== "F") return false;
  const ageInMonths = calculateAgeInMonths(animal.born_date);
  return ageInMonths >= 25;
}

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
          // Filtrar apenas as que têm 25+ meses
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
