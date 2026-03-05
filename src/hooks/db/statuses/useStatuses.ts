"use client";

import { useLocalQuery } from "@/hooks/core";
import { AnimalStatus } from "@/types/status.type";

export function useStatuses() {
  const { data, loading, error, actions } = useLocalQuery<AnimalStatus>(
    "animal_statuses",
    {
      selector: {
        _deleted: { $eq: false },
      },
      sort: [{ status_name: "asc" }],
    },
  );

  return {
    data,
    loading,
    error,
    actions,
  };
}
