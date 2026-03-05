"use client";

import { useMemo } from "react";
import { useLocalQuery } from "@/hooks/core";
import { AnimalMetric } from "@/types/animal_metrics.type";

export function useAnimalCE(rgn?: string) {
  const query = useMemo(
    () => ({
      selector: {
        _deleted: { $eq: false },
        ...(rgn ? { rgn: { $eq: rgn } } : {}),
      },
      sort: [{ date: "asc" } as any],
    }),
    [rgn],
  );

  const { data, loading, error, actions } = useLocalQuery<AnimalMetric>(
    "animal_metrics_ce",
    query,
  );

  return {
    data,
    loading,
    error,
    actions,
  };
}
