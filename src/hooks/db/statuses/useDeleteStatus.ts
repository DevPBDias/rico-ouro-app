"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalStatus } from "@/types/status.type";

export function useDeleteStatus() {
  const { loading, error, actions } =
    useLocalMutation<AnimalStatus>("animal_statuses");

  const deleteStatus = async (id: string): Promise<void> => {
    await actions.remove(id);
  };

  return {
    loading,
    error,
    actions: {
      ...actions,
      deleteStatus,
    },
  };
}
