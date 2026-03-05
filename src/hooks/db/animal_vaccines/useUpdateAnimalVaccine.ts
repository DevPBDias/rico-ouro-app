"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalVaccine } from "@/types/vaccine.type";

export function useUpdateAnimalVaccine() {
  const { loading, error, actions } =
    useLocalMutation<AnimalVaccine>("animal_vaccines");

  const updateAnimalVaccine = async (
    id: string,
    data: Partial<AnimalVaccine>,
  ): Promise<void> => {
    await actions.update(id, data);
  };

  return {
    loading,
    error,
    actions: {
      ...actions,
      updateAnimalVaccine,
    },
  };
}
