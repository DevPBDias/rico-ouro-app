"use client";

import { useLocalMutation } from "@/hooks/core";
import { FarmDocType } from "@/types/database.types";

export function useDeleteFarm() {
  const { remove, isLoading, error } = useLocalMutation<FarmDocType>("farms");

  const deleteFarm = async (uuid: string): Promise<void> => {
    await remove(uuid);
  };

  return {
    deleteFarm,
    isLoading,
    error,
  };
}
