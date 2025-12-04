"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalVaccine } from "@/types/vaccine.type";

export function useCreateAnimalVaccine() {
  const { create, isLoading, error } = useLocalMutation<AnimalVaccine>("animal_vaccines");

  const createAnimalVaccine = async (data: Partial<AnimalVaccine>): Promise<AnimalVaccine> => {
    return await create(data);
  };

  return {
    createAnimalVaccine,
    isLoading,
    error,
  };
}
