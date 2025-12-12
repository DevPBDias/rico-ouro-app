"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalStatus } from "@/types/status.type";

export function useDeleteStatus() {
  const { remove, isLoading, error } = useLocalMutation<AnimalStatus>("animal_statuses");

  const deleteStatus = async (id: string): Promise<void> => {
    await remove(id);
  };

  return {
    deleteStatus,
    isLoading,
    error,
  };
}
