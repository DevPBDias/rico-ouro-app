"use client";

import { useMemo } from "react";
import { useLocalQuery } from "@/hooks/core";
import { Exchange } from "@/types/exchange.type";
import type { MangoQuery } from "rxdb";

export function useExchangeById(id: string | null | undefined) {
  const query = useMemo<MangoQuery<Exchange> | null>(() => {
    if (!id) return null;
    return {
      selector: {
        id: { $eq: id },
      },
    };
  }, [id]);

  const { data, isLoading, error } = useLocalQuery<Exchange>(
    "exchanges",
    query,
  );

  return {
    exchange: data?.[0],
    isLoading,
    error,
  };
}
