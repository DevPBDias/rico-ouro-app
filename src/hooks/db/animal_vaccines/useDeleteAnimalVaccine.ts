"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalVaccine } from "@/types/vaccine.type";

export function useDeleteAnimalVaccine() {
  const { remove, isLoading, error } = useLocalMutation<AnimalVaccine>("animal_vaccines");

  const deleteAnimalVaccine = async (id: number): Promise<void> => {
    await remove(id.toString());
  };

  return {
    deleteAnimalVaccine,
    isLoading,
    error,
  };
}
