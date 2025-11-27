"use client";

import { useLocalMutation } from "@/hooks/core";
import { MatrizDocType } from "@/types/database.types";

export function useDeleteMatriz() {
  const { remove, isLoading, error } =
    useLocalMutation<MatrizDocType>("matriz");

  const deleteMatriz = async (uuid: string): Promise<void> => {
    await remove(uuid);
  };

  return {
    deleteMatriz,
    isLoading,
    error,
  };
}
