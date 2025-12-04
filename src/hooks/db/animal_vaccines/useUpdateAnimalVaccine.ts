"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalVaccine } from "@/types/vaccine.type";

export function useUpdateAnimalVaccine() {
  const { update, isLoading, error } = useLocalMutation<AnimalVaccine>("animal_vaccines");

  const updateAnimalVaccine = async (
    id: number,
    data: Partial<AnimalVaccine>
  ): Promise<void> => {
    await update(id.toString(), data);
  };

  return {
    updateAnimalVaccine,
    isLoading,
    error,
  };
}
