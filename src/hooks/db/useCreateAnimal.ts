"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalDocType } from "@/types/database.types";
import { AnimalData } from "@/types/schemas.types";

export function useCreateAnimal() {
  const { create, isLoading, error } =
    useLocalMutation<AnimalDocType>("animals");

  const createAnimal = async (data: AnimalData): Promise<string> => {
    const uuid = data.uuid || crypto.randomUUID();

    const animalData: Partial<AnimalDocType> = {
      ...data,
      uuid,
      updatedAt: new Date().toISOString(),
      _deleted: false,
    };

    return await create(animalData);
  };

  return {
    createAnimal,
    isLoading,
    error,
  };
}
