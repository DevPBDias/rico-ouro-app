"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalMetric } from "@/types/animal_metrics.type";

export function useDeleteAnimalWeight() {
  const { remove, isLoading, error } = useLocalMutation<AnimalMetric>("animal_metrics_weight");

  const deleteWeight = async (id: string): Promise<void> => {
    await remove(id);
  };

  return {
    deleteWeight,
    isLoading,
    error,
  };
}
