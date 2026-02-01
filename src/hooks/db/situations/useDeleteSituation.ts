"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalSituation } from "@/types/situation.type";

export function useDeleteSituation() {
  const { remove, isLoading, error } = useLocalMutation<AnimalSituation>("animal_situations");

  const deleteSituation = async (id: string): Promise<void> => {
    await remove(id);
  };

  return {
    deleteSituation,
    isLoading,
    error,
  };
}
