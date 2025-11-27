"use client";

import { useLocalMutation } from "@/hooks/core";
import { MatrizDocType } from "@/types/database.types";

export function useCreateMatriz() {
  const { create, isLoading, error } =
    useLocalMutation<MatrizDocType>("matriz");

  const createMatriz = async (
    data: Partial<MatrizDocType>
  ): Promise<string> => {
    const uuid = data.uuid || crypto.randomUUID();

    const matrizData: Partial<MatrizDocType> = {
      ...data,
      uuid,
      _deleted: false,
    };

    return await create(matrizData);
  };

  return {
    createMatriz,
    isLoading,
    error,
  };
}
