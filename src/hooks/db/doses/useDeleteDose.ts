"use client";

import { useLocalMutation } from "@/hooks/core";
import { SemenDose } from "@/types/semen_dose.type";

export function useDeleteDose() {
  const { remove, isLoading, error } = useLocalMutation<SemenDose>("semen_doses");

  const deleteDose = async (id: string): Promise<void> => {
    await remove(id);
  };

  return {
    deleteDose,
    isLoading,
    error,
  };
}
