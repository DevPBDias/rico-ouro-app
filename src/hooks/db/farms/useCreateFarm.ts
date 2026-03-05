"use client";

import { useLocalMutation } from "@/hooks/core";
import { Farm } from "@/types/farm.type";
import { v4 as uuidv4 } from "uuid";

export function useCreateFarm() {
  const { loading, error, actions } = useLocalMutation<Farm>("farms");

  const createFarm = async (data: Partial<Farm>): Promise<Farm> => {
    const farmData = {
      ...data,
      id: data.id || uuidv4(),
    };
    return await actions.create(farmData);
  };

  return {
    data: null,
    loading,
    error,
    actions: {
      ...actions,
      createFarm,
    },
  };
}
