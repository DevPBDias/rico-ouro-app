"use client";

import { useLocalMutation } from "@/hooks/core";
import { Vaccine } from "@/types/vaccine.type";

export function useDeleteVaccine() {
  const { remove, isLoading, error } = useLocalMutation<Vaccine>("vaccines");

  const deleteVaccine = async (id: string): Promise<void> => {
    await remove(id);
  };

  return {
    deleteVaccine,
    isLoading,
    error,
  };
}
