"use client";

import { useLocalMutation } from "@/hooks/core";
import { VaccineTypeDocType } from "@/types/database.types";

export function useUpdateVaccine() {
  const { update, isLoading, error } =
    useLocalMutation<VaccineTypeDocType>("vaccines");

  const updateVaccine = async (
    uuid: string,
    data: Partial<VaccineTypeDocType>
  ): Promise<void> => {
    await update(uuid, data);
  };

  return {
    updateVaccine,
    isLoading,
    error,
  };
}
