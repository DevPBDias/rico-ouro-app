"use client";

import { useLocalMutation } from "@/hooks/core";
import { Farm } from "@/types/farm.type";

export function useDeleteFarm() {
  const { loading, error, actions } = useLocalMutation<Farm>("farms");

  const deleteFarm = async (id: string): Promise<void> => {
    await actions.remove(id);
  };

  return {
    data: null,
    loading,
    error,
    actions: {
      ...actions,
      deleteFarm,
    },
  };
}
