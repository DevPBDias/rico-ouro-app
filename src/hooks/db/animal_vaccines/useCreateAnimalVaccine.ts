"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalVaccine } from "@/types/vaccine.type";
import { v4 as uuidv4 } from "uuid";

export function useCreateAnimalVaccine() {
  const { loading, error, actions } =
    useLocalMutation<AnimalVaccine>("animal_vaccines");

  const createAnimalVaccine = async (
    data: Omit<AnimalVaccine, "id" | "updated_at" | "_deleted" | "created_at">,
  ): Promise<AnimalVaccine> => {
    const newVaccine: Partial<AnimalVaccine> = {
      id: uuidv4(),
      ...data,
    };

    return await actions.create(newVaccine);
  };

  return {
    loading,
    error,
    actions: {
      ...actions,
      createAnimalVaccine,
    },
  };
}
