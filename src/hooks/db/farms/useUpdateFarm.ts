"use client";

import { useLocalMutation } from "@/hooks/core";
import { Farm } from "@/types/farm.type";

export function useUpdateFarm() {
  const { loading, error, actions } = useLocalMutation<Farm>("farms");

  const updateFarm = async (id: string, data: Partial<Farm>): Promise<void> => {
    await actions.update(id, data);
  };

  return {
    data: null,
    loading,
    error,
    actions: {
      ...actions,
      updateFarm,
    },
  };
}
