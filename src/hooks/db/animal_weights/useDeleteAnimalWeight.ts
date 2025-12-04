"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalMetric } from "@/types/animal_metrics.type";

export function useDeleteAnimalWeight() {
  const { remove, isLoading, error } = useLocalMutation<AnimalMetric>("animal_metrics_weight");

  const deleteWeight = async (id: number): Promise<void> => {
    await remove(id.toString());
  };

  return {
    deleteWeight,
    isLoading,
    error,
  };
}
