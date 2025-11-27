"use client";

import { useLocalDocument } from "@/hooks/core";
import { MatrizDocType } from "@/types/database.types";

/**
 * Hook para buscar uma matriz específica por UUID
 */
export function useMatriz(uuid: string | null | undefined) {
  const { data, isLoading, error, refetch } = useLocalDocument<MatrizDocType>(
    "matriz",
    uuid
  );

  return {
    matriz: data,
    isLoading,
    error,
    refetch,
  };
}
