"use client";

import { useLocalDocument } from "@/hooks/core";
import { VaccineTypeDocType } from "@/types/database.types";

/**
 * Hook para buscar uma vacina específica por UUID
 */
export function useVaccine(uuid: string | null | undefined) {
  const { data, isLoading, error, refetch } =
    useLocalDocument<VaccineTypeDocType>("vaccines", uuid);

  return {
    vaccine: data,
    isLoading,
    error,
    refetch,
  };
}
