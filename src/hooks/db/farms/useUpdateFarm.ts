"use client";

import { useLocalMutation } from "@/hooks/core";
import { Farm } from "@/types/farm.type";

export function useUpdateFarm() {
  const { update, isLoading, error } = useLocalMutation<Farm>("farms");

  const updateFarm = async (id: string, data: Partial<Farm>): Promise<void> => {
    await update(id, data);
  };

  return {
    updateFarm,
    isLoading,
    error,
  };
}
