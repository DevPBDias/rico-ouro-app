"use client";

import { useLocalMutation } from "@/hooks/core";
import { Farm } from "@/types/farm.type";

import { v4 as uuidv4 } from "uuid";

export function useCreateFarm() {
  const { create, isLoading, error } = useLocalMutation<Farm>("farms");

  const createFarm = async (data: Partial<Farm>): Promise<Farm> => {
    const farmData = {
      ...data,
      id: data.id || uuidv4(),
    };
    return await create(farmData);
  };

  return {
    createFarm,
    isLoading,
    error,
  };
}
