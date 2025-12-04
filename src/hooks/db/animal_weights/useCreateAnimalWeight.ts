"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalMetric } from "@/types/animal_metrics.type";

export function useCreateAnimalWeight() {
  const { create, isLoading, error } = useLocalMutation<AnimalMetric>("animal_metrics_weight");

  const createWeight = async (data: Partial<AnimalMetric>): Promise<AnimalMetric> => {
    return await create(data);
  };

  return {
    createWeight,
    isLoading,
    error,
  };
}
