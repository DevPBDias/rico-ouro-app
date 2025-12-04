"use client";

import { useLocalMutation } from "@/hooks/core";
import { Animal } from "@/types/animal.type";

export function useDeleteAnimal() {
  const { remove, isLoading, error } = useLocalMutation<Animal>("animals");

  const deleteAnimal = async (rgn: string): Promise<void> => {
    await remove(rgn);
  };

  return {
    deleteAnimal,
    isLoading,
    error,
  };
}
