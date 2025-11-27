"use client";

import { useLocalMutation } from "@/hooks/core";
import { VaccineTypeDocType } from "@/types/database.types";

export function useCreateVaccine() {
  const { create, isLoading, error } =
    useLocalMutation<VaccineTypeDocType>("vaccines");

  const createVaccine = async (
    data: Partial<VaccineTypeDocType>
  ): Promise<string> => {
    const uuid = data.uuid || crypto.randomUUID();

    const vaccineData: Partial<VaccineTypeDocType> = {
      ...data,
      uuid,
      _deleted: false,
    };

    return await create(vaccineData);
  };

  return {
    createVaccine,
    isLoading,
    error,
  };
}
