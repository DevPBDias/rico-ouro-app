"use client";

import { useMemo } from "react";
import { useLocalQuery } from "@/hooks/core";
import { Movement } from "@/types/movement.type";
import { MangoQuery } from "rxdb";

export function useMovementsByAnimal(rgn: string | null) {
  const query = useMemo<MangoQuery<Movement>>(() => {
    return {
      selector: {
        animal_id: { $eq: rgn || "" },
        _deleted: { $eq: false },
      },
      sort: [{ date: "desc" } as any],
    };
  }, [rgn]);

  const {
    data: movements,
    isLoading,
    error,
    refetch,
  } = useLocalQuery<Movement>("movements", query);

  return {
    movements,
    isLoading,
    error,
    refetch,
  };
}
