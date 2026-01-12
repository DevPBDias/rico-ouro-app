"use client";

import { useLocalQuery } from "@/hooks/core/useLocalQuery";
import { Animal } from "@/types/animal.type";
import { useMemo } from "react";
import type { MangoQuery } from "rxdb";

/**
 * Hook reativo para obter a lista de todos os animais não deletados.
 * Utiliza a abstração useLocalQuery para garantir consistência e performance.
 */
export function useAnimals() {
  const query = useMemo<MangoQuery<Animal>>(
    () => ({
      selector: {
        _deleted: { $eq: false },
      },
      sort: [{ rgn: "asc" } as any], // Cast necessário para compatibilidade com MangoQuery do RxDB
    }),
    []
  );

  const {
    data: animals,
    isLoading,
    error,
    refetch,
  } = useLocalQuery<Animal>("animals", query);

  return {
    animals,
    isLoading,
    error,
    refetch,
  };
}
