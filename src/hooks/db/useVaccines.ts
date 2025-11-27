"use client";

import { useLocalQuery } from "@/hooks/core";
import { VaccineTypeDocType } from "@/types/database.types";
import { useMemo } from "react";

/**
 * Hook para buscar todas as vacinas
 */
export function useVaccines() {
  const query = useMemo(
    () => ({
      selector: {
        _deleted: { $eq: false },
      },
      sort: [{ vaccineName: "asc" as "asc" | "desc" }],
    }),
    []
  );

  const { data, isLoading, error, refetch } = useLocalQuery<VaccineTypeDocType>(
    "vaccines",
    query
  );

  return {
    vaccines: data,
    isLoading,
    error,
    refetch,
  };
}
