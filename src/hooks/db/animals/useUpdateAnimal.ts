"use client";

import { useLocalMutation } from "@/hooks/core";
import { Animal } from "@/types/animal.type";

export function useUpdateAnimal() {
  const { update, isLoading, error } = useLocalMutation<Animal>("animals");

  const updateAnimal = async (
    rgn: string,
    data: Partial<Animal>
  ): Promise<void> => {
    const updateData: Partial<Animal> = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    await update(rgn, updateData);
  };

  return {
    updateAnimal,
    isLoading,
    error,
  };
}
