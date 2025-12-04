"use client";

import { useLocalMutation } from "@/hooks/core";
import { Farm } from "@/types/farm.type";

export function useCreateFarm() {
  const { create, isLoading, error } = useLocalMutation<Farm>("farms");

  const createFarm = async (data: Partial<Farm>): Promise<Farm> => {
    return await create(data);
  };

  return {
    createFarm,
    isLoading,
    error,
  };
}
