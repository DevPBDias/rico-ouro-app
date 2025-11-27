"use client";

import { useLocalQuery } from "@/hooks/core";
import { FarmDocType } from "@/types/database.types";
import { useMemo } from "react";

/**
 * Hook para buscar todas as fazendas
 */
export function useFarms() {
  const query = useMemo(
    () => ({
      selector: {
        _deleted: { $eq: false },
      },
      sort: [{ farmName: "asc" as "asc" | "desc" }],
    }),
    []
  );

  const { data, isLoading, error, refetch } = useLocalQuery<FarmDocType>(
    "farms",
    query
  );

  return {
    farms: data,
    isLoading,
    error,
    refetch,
  };
}
