"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalDocType } from "@/types/database.types";

/**
 * Hook para deletar um animal
 *
 * A sincronização com Supabase é AUTOMÁTICA via RxDB Replication
 * Não é necessário usar enqueueRequest
 *
 * @returns {deleteAnimal, isLoading, error}
 *
 * @example
 * const { deleteAnimal, isLoading } = useDeleteAnimal();
 * await deleteAnimal(uuid);
 */
export function useDeleteAnimal() {
  const { remove, isLoading, error } =
    useLocalMutation<AnimalDocType>("animals");

  const deleteAnimal = async (uuid: string): Promise<void> => {
    // A replicação automática do RxDB irá sincronizar com Supabase
    await remove(uuid);
  };

  return {
    deleteAnimal,
    isLoading,
    error,
  };
}
