"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalVaccine } from "@/types/vaccine.type";

import { v4 as uuidv4 } from "uuid";

export function useCreateAnimalVaccine() {
  const { create, isLoading, error } =
    useLocalMutation<AnimalVaccine>("animal_vaccines");

  const createAnimalVaccine = async (
    data: Partial<AnimalVaccine>
  ): Promise<AnimalVaccine> => {
    const vaccineData = {
      ...data,
      id: data.id || uuidv4(),
    };
    return await create(vaccineData);
  };

  return {
    createAnimalVaccine,
    isLoading,
    error,
  };
}
