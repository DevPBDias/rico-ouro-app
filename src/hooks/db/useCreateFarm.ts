"use client";

import { useLocalMutation } from "@/hooks/core";
import { FarmDocType } from "@/types/database.types";

export function useCreateFarm() {
  const { create, isLoading, error } = useLocalMutation<FarmDocType>("farms");

  const createFarm = async (data: Partial<FarmDocType>): Promise<string> => {
    const uuid = data.uuid || crypto.randomUUID();

    const farmData: Partial<FarmDocType> = {
      ...data,
      uuid,
      _deleted: false,
    };

    return await create(farmData);
  };

  return {
    createFarm,
    isLoading,
    error,
  };
}
