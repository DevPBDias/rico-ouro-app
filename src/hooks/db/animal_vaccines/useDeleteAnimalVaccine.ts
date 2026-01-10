"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalVaccine } from "@/types/vaccine.type";

export function useDeleteAnimalVaccine() {
  const { remove, isLoading, error } = useLocalMutation<AnimalVaccine>("animal_vaccines");

  const deleteAnimalVaccine = async (id: string): Promise<void> => {
    await remove(id);
  };

  return {
    deleteAnimalVaccine,
    isLoading,
    error,
  };
}
