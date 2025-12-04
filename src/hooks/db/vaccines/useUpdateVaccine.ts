"use client";

import { useLocalMutation } from "@/hooks/core";
import { Vaccine } from "@/types/vaccine.type";

export function useUpdateVaccine() {
  const { update, isLoading, error } = useLocalMutation<Vaccine>("vaccines");

  const updateVaccine = async (
    id: string,
    data: Partial<Vaccine>
  ): Promise<void> => {
    await update(id, data);
  };

  return {
    updateVaccine,
    isLoading,
    error,
  };
}
