"use client";

import { useLocalMutation } from "@/hooks/core";
import { Animal } from "@/types/animal.type";

export function useCreateAnimal() {
  const { create, upsert, isLoading, error } =
    useLocalMutation<Animal>("animals");

  const createAnimal = async (data: Partial<Animal>): Promise<Animal> => {
    const animalData: Animal = {
      ...data,
    } as Animal;

    // Returns the created animal document
    return await create(animalData);
  };

  const saveAnimal = async (data: Partial<Animal>): Promise<Animal> => {
    const animalData: Animal = {
      ...data,
    } as Animal;

    // Returns the upserted animal document
    return await upsert(animalData);
  };

  return {
    createAnimal,
    saveAnimal,
    isLoading,
    error,
  };
}
