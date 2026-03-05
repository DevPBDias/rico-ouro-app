"use client";

import { useLocalMutation } from "@/hooks/core";
import { Vaccine } from "@/types/vaccine.type";

export function useUpdateVaccine() {
  const { loading, error, actions } = useLocalMutation<Vaccine>("vaccines");

  const updateVaccine = async (
    id: string,
    data: Partial<Vaccine>,
  ): Promise<void> => {
    await actions.update(id, data);
  };

  return {
    data: null,
    loading,
    error,
    actions: {
      ...actions,
      updateVaccine,
    },
  };
}
