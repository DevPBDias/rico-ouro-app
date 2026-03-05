"use client";

import { useLocalMutation } from "@/hooks/core";
import { Animal } from "@/types/animal.type";

export function useDeleteAnimal() {
  const { loading, error, actions } = useLocalMutation<Animal>("animals");

  const deleteAnimal = async (rgn: string): Promise<void> => {
    await actions.remove(rgn);
  };

  return {
    data: null,
    loading,
    error,
    actions: {
      ...actions,
      deleteAnimal,
    },
  };
}
