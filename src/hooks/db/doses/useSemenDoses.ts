"use client";

import { useMemo } from "react";
import { useLocalQuery } from "@/hooks/core";
import { SemenDose } from "@/types/semen_dose.type";

export function useSemenDoses() {
  const query = useMemo(
    () => ({
      selector: {
        _deleted: { $eq: false },
      },
      sort: [{ updated_at: "desc" } as any],
    }),
    [],
  );

  const { data, loading, error, actions } = useLocalQuery<SemenDose>(
    "semen_doses",
    query,
  );

  return {
    data,
    loading,
    error,
    actions,
  };
}
