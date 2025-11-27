"use client";

import { useLocalMutation } from "@/hooks/core";
import { FarmDocType } from "@/types/database.types";

export function useUpdateFarm() {
  const { update, isLoading, error } = useLocalMutation<FarmDocType>("farms");

  const updateFarm = async (
    uuid: string,
    data: Partial<FarmDocType>
  ): Promise<void> => {
    await update(uuid, data);
  };

  return {
    updateFarm,
    isLoading,
    error,
  };
}
