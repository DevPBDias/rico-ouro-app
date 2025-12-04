"use client";

import { useLocalMutation } from "@/hooks/core";
import { Farm } from "@/types/farm.type";

export function useDeleteFarm() {
  const { remove, isLoading, error } = useLocalMutation<Farm>("farms");

  const deleteFarm = async (id: string): Promise<void> => {
    await remove(id);
  };

  return {
    deleteFarm,
    isLoading,
    error,
  };
}
