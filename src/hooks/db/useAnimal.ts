"use client";

import { useLocalDocument } from "@/hooks/core";
import { AnimalDocType } from "@/types/database.types";

/**
 * Hook para buscar um animal específico por UUID
 *
 * @param uuid - UUID do animal
 * @returns {animal, isLoading, error, refetch}
 */
export function useAnimal(uuid: string | null | undefined) {
  const { data, isLoading, error, refetch } = useLocalDocument<AnimalDocType>(
    "animals",
    uuid
  );

  return {
    animal: data,
    isLoading,
    error,
    refetch,
  };
}
