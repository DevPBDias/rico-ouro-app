"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalMetric } from "@/types/animal_metrics.type";

import { v4 as uuidv4 } from "uuid";

export function useCreateAnimalCE() {
  const { create, isLoading, error } =
    useLocalMutation<AnimalMetric>("animal_metrics_ce");

  const createCE = async (
    data: Partial<AnimalMetric>
  ): Promise<AnimalMetric> => {
    const ceData = {
      ...data,
      id: data.id || uuidv4(),
    };
    return await create(ceData);
  };

  return {
    createCE,
    isLoading,
    error,
  };
}
