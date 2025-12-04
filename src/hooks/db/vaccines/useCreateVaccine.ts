"use client";

import { useLocalMutation } from "@/hooks/core";
import { Vaccine } from "@/types/vaccine.type";

export function useCreateVaccine() {
  const { create, isLoading, error } = useLocalMutation<Vaccine>("vaccines");

  const createVaccine = async (data: Partial<Vaccine>): Promise<Vaccine> => {
    return await create(data);
  };

  return {
    createVaccine,
    isLoading,
    error,
  };
}
