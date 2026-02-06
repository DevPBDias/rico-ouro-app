"use client";

import { useLocalQuery } from "@/hooks/core";
import { Sale } from "@/types/sale.type";
import { useMemo } from "react";
import type { MangoQuery } from "rxdb";

export function useSaleById(id: string) {
  const query = useMemo<MangoQuery<Sale>>(() => ({
    selector: {
      id: { $eq: id },
      _deleted: { $eq: false },
    },
  }), [id]);

  const { data, isLoading, error } = useLocalQuery<Sale>("sales", query);

  return {
    sale: data?.[0] || null,
    isLoading,
    error,
  };
}
