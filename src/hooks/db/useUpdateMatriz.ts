"use client";

import { useLocalMutation } from "@/hooks/core";
import { MatrizDocType } from "@/types/database.types";

export function useUpdateMatriz() {
  const { update, isLoading, error } =
    useLocalMutation<MatrizDocType>("matriz");

  const updateMatriz = async (
    uuid: string,
    data: Partial<MatrizDocType>
  ): Promise<void> => {
    await update(uuid, data);
  };

  return {
    updateMatriz,
    isLoading,
    error,
  };
}
