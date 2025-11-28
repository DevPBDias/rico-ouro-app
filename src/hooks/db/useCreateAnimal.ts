"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalDocType } from "@/types/database.types";
import { AnimalData } from "@/types/schemas.types";

/**
 * Hook para criar um novo animal
 *
 * A sincronização com Supabase é AUTOMÁTICA via RxDB Replication
 * Não é necessário usar enqueueRequest
 *
 * @returns {createAnimal, isLoading, error}
 *
 * @example
 * const { createAnimal, isLoading } = useCreateAnimal();
 * await createAnimal(animalData);
 */
export function useCreateAnimal() {
  const { create, isLoading, error } =
    useLocalMutation<AnimalDocType>("animals");

  const createAnimal = async (data: AnimalData): Promise<string> => {
    const uuid = data.uuid || crypto.randomUUID();

    const animalData: Partial<AnimalDocType> = {
      ...data,
      uuid,
      _modified: new Date().toISOString(),
      _deleted: false,
    };

    // A replicação automática do RxDB irá sincronizar com Supabase
    return await create(animalData);
  };

  return {
    createAnimal,
    isLoading,
    error,
  };
}
