"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalMetric } from "@/types/animal_metrics.type";

export function useUpdateAnimalCE() {
  const { update, isLoading, error } = useLocalMutation<AnimalMetric>("animal_metrics_ce");

  const updateCE = async (
    id: string,
    data: Partial<AnimalMetric>
  ): Promise<void> => {
    await update(id, data);
  };

  return {
    updateCE,
    isLoading,
    error,
  };
}
