"use client";

import { useLocalQuery } from "@/hooks/core";
import { AnimalDocType } from "@/types/database.types";
import { useMemo } from "react";

/**
 * Hook para buscar todos os animais com filtros opcionais
 *
 * @example
 * const { animals, isLoading, error } = useAnimals();
 * const { animals } = useAnimals({ farmId: "123", sex: "M" });
 */
export function useAnimals(filters?: {
  farmId?: string;
  sex?: "M" | "F";
  status?: string;
  search?: string;
}) {
  const query = useMemo(() => {
    const selector: Record<string, unknown> = {
      _deleted: { $eq: false },
    };

    if (filters?.farmId) {
      selector["animal.farm"] = { $eq: filters.farmId };
    }

    if (filters?.sex) {
      selector["animal.sexo"] = { $eq: filters.sex };
    }

    if (filters?.status) {
      selector["animal.status"] = { $eq: filters.status };
    }

    if (filters?.search) {
      selector["animal.nome"] = { $regex: new RegExp(filters.search, "i") };
    }

    return {
      selector,
      sort: [{ updatedAt: "desc" as "desc" | "asc" }],
    };
  }, [filters?.farmId, filters?.sex, filters?.status, filters?.search]);

  const { data, isLoading, error, refetch } = useLocalQuery<AnimalDocType>(
    "animals",
    query
  );

  return {
    animals: data,
    isLoading,
    error,
    refetch,
  };
}
