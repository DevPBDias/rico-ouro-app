"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalMetric } from "@/types/animal_metrics.type";

export function useDeleteAnimalWeight() {
  const { loading, error, actions } = useLocalMutation<AnimalMetric>(
    "animal_metrics_weight",
  );

  const deleteAnimalWeight = async (id: string): Promise<void> => {
    await actions.remove(id);
  };

  return {
    data: null,
    loading,
    error,
    actions: {
      ...actions,
      deleteAnimalWeight,
    },
  };
}
