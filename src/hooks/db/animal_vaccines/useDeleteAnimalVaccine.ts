"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalVaccine } from "@/types/vaccine.type";

export function useDeleteAnimalVaccine() {
  const { loading, error, actions } =
    useLocalMutation<AnimalVaccine>("animal_vaccines");

  const deleteAnimalVaccine = async (id: string): Promise<void> => {
    await actions.remove(id);
  };

  return {
    loading,
    error,
    actions: {
      ...actions,
      deleteAnimalVaccine,
    },
  };
}
