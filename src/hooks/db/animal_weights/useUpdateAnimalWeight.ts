"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalMetric } from "@/types/animal_metrics.type";

export function useUpdateAnimalWeight() {
  const { update, isLoading, error } = useLocalMutation<AnimalMetric>("animal_metrics_weight");

  const updateWeight = async (
    id: number,
    data: Partial<AnimalMetric>
  ): Promise<void> => {
    await update(id.toString(), data);
  };

  return {
    updateWeight,
    isLoading,
    error,
  };
}
