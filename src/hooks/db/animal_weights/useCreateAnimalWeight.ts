"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalMetric } from "@/types/animal_metrics.type";

import { v4 as uuidv4 } from "uuid";

export function useCreateAnimalWeight() {
  const { create, isLoading, error } = useLocalMutation<AnimalMetric>(
    "animal_metrics_weight"
  );

  const createWeight = async (
    data: Partial<AnimalMetric>
  ): Promise<AnimalMetric> => {
    const weightData = {
      ...data,
      id: data.id || uuidv4(),
    };
    return await create(weightData);
  };

  return {
    createWeight,
    isLoading,
    error,
  };
}
