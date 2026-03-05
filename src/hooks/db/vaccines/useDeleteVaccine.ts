"use client";

import { useLocalMutation } from "@/hooks/core";
import { Vaccine } from "@/types/vaccine.type";

export function useDeleteVaccine() {
  const { loading, error, actions } = useLocalMutation<Vaccine>("vaccines");

  const deleteVaccine = async (id: string): Promise<void> => {
    await actions.remove(id);
  };

  return {
    data: null,
    loading,
    error,
    actions: {
      ...actions,
      deleteVaccine,
    },
  };
}
