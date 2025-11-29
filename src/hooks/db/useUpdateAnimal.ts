"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalDocType } from "@/types/database.types";
import { AnimalData } from "@/types/schemas.types";

export function useUpdateAnimal() {
  const { update, isLoading, error } =
    useLocalMutation<AnimalDocType>("animals");

  const updateAnimal = async (
    uuid: string,
    data: Partial<AnimalData>
  ): Promise<void> => {
    const updateData: Partial<AnimalDocType> = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // A replicação automática do RxDB irá sincronizar com Supabase
    await update(uuid, updateData);
  };

  return {
    updateAnimal,
    isLoading,
    error,
  };
}
