"use client";

import { useLocalDocument } from "@/hooks/core";
import { FarmDocType } from "@/types/database.types";

/**
 * Hook para buscar uma fazenda específica por UUID
 */
export function useFarm(uuid: string | null | undefined) {
  const { data, isLoading, error, refetch } = useLocalDocument<FarmDocType>(
    "farms",
    uuid
  );

  return {
    farm: data,
    isLoading,
    error,
    refetch,
  };
}
