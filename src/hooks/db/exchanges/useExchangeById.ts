"use client";

import { useLocalDocument } from "@/hooks/core/useLocalDocument";
import { Exchange } from "@/types/exchange.type";

export function useExchangeById(id: string | null | undefined) {
  const { data, loading, error, actions } = useLocalDocument<Exchange>(
    "exchanges",
    id,
  );

  return {
    data,
    loading,
    error,
    actions,
  };
}
