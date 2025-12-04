"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalMetric } from "@/types/animal_metrics.type";

export function useCreateAnimalCE() {
  const { create, isLoading, error } = useLocalMutation<AnimalMetric>("animal_metrics_ce");

  const createCE = async (data: Partial<AnimalMetric>): Promise<AnimalMetric> => {
    return await create(data);
  };

  return {
    createCE,
    isLoading,
    error,
  };
}
