"use client";

import { useLocalMutation } from "@/hooks/core";
import { VaccineTypeDocType } from "@/types/database.types";

export function useDeleteVaccine() {
  const { remove, isLoading, error } =
    useLocalMutation<VaccineTypeDocType>("vaccines");

  const deleteVaccine = async (uuid: string): Promise<void> => {
    await remove(uuid);
  };

  return {
    deleteVaccine,
    isLoading,
    error,
  };
}
