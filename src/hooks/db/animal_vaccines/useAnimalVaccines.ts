"use client";

import { useMemo } from "react";
import { useLocalQuery } from "@/hooks/core";
import { AnimalVaccine } from "@/types/vaccine.type";

export function useAnimalVaccines(rgn?: string) {
  const query = useMemo(() => {
    if (!rgn) return null;
    return {
      selector: {
        _deleted: { $eq: false },
        rgn: { $eq: rgn },
      },
      sort: [{ date: "desc" } as any],
    };
  }, [rgn]);

  const { data, loading, error, actions } = useLocalQuery<AnimalVaccine>(
    "animal_vaccines",
    query,
  );

  return {
    data,
    loading,
    error,
    actions,
  };
}
