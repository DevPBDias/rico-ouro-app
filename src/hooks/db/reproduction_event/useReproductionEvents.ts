"use client";

import { useMemo } from "react";
import { useLocalQuery } from "@/hooks/core";
import { ReproductionEvent } from "@/types/reproduction_event.type";

export function useReproductionEvents(rgn?: string) {
  const query = useMemo(
    () => ({
      selector: {
        _deleted: { $eq: false },
        ...(rgn ? { rgn: { $eq: rgn } } : {}),
      },
      sort: [{ d0_date: "desc" } as any],
    }),
    [rgn],
  );

  const { data, loading, error, actions } = useLocalQuery<ReproductionEvent>(
    "reproduction_events",
    query,
  );

  return {
    data,
    loading,
    error,
    actions,
  };
}
