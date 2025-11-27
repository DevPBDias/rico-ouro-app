"use client";

import { useLocalQuery } from "@/hooks/core";
import { MatrizDocType } from "@/types/database.types";
import { useMemo } from "react";

/**
 * Hook para buscar todas as matrizes com filtros opcionais
 */
export function useMatrizes(filters?: {
  farmId?: string;
  type?: "Doadora" | "Reprodutora" | "Receptora FIV";
  condition?: "Parida" | "Solteira";
  search?: string;
}) {
  const query = useMemo(() => {
    const selector: Record<string, unknown> = {
      _deleted: { $eq: false },
    };

    if (filters?.farmId) {
      selector.farm = { $eq: filters.farmId };
    }

    if (filters?.type) {
      selector.type = { $eq: filters.type };
    }

    if (filters?.condition) {
      selector.condition = { $eq: filters.condition };
    }

    if (filters?.search) {
      selector.nome = { $regex: new RegExp(filters.search, "i") };
    }

    return {
      selector,
      sort: [{ updatedAt: "desc" as "desc" | "asc" }],
    };
  }, [filters?.farmId, filters?.type, filters?.condition, filters?.search]);

  const { data, isLoading, error, refetch } = useLocalQuery<MatrizDocType>(
    "matriz",
    query
  );

  return {
    matrizes: data,
    isLoading,
    error,
    refetch,
  };
}
