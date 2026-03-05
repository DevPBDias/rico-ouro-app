"use client";

import { useLocalDocument } from "@/hooks/core/useLocalDocument";
import { Death } from "@/types/death.type";

export function useDeathById(id: string | null | undefined) {
  const { data, loading, error, actions } = useLocalDocument<Death>(
    "deaths",
    id,
  );

  return {
    data,
    loading,
    error,
    actions,
  };
}
