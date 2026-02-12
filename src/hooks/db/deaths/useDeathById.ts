"use client";

import { useMemo } from "react";
import { useLocalQuery } from "@/hooks/core";
import { Death } from "@/types/death.type";
import type { MangoQuery } from "rxdb";

export function useDeathById(id: string | null | undefined) {
  const query = useMemo<MangoQuery<Death> | null>(() => {
    if (!id) return null;
    return {
      selector: {
        id: { $eq: id },
      },
    };
  }, [id]);

  const { data, isLoading, error } = useLocalQuery<Death>("deaths", query);

  return {
    death: data?.[0],
    isLoading,
    error,
  };
}
