"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalDocType } from "@/types/database.types";

export function useDeleteAnimal() {
  const { remove, isLoading, error } =
    useLocalMutation<AnimalDocType>("animals");

  const deleteAnimal = async (uuid: string): Promise<void> => {
    await remove(uuid);
  };

  return {
    deleteAnimal,
    isLoading,
    error,
  };
}
