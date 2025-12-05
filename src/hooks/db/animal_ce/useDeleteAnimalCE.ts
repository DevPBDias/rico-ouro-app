"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalMetric } from "@/types/animal_metrics.type";

export function useDeleteAnimalCE() {
  const { remove, isLoading, error } = useLocalMutation<AnimalMetric>("animal_metrics_ce");

  const deleteCE = async (id: string): Promise<void> => {
    await remove(id);
  };

  return {
    deleteCE,
    isLoading,
    error,
  };
}
