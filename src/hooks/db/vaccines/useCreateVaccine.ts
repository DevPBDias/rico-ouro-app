"use client";

import { useLocalMutation } from "@/hooks/core";
import { Vaccine } from "@/types/vaccine.type";
import { v4 as uuidv4 } from "uuid";

export function useCreateVaccine() {
  const { loading, error, actions } = useLocalMutation<Vaccine>("vaccines");

  const createVaccine = async (data: Partial<Vaccine>): Promise<Vaccine> => {
    const vaccineData = {
      ...data,
      id: data.id || uuidv4(),
    };
    return await actions.create(vaccineData);
  };

  return {
    data: null,
    loading,
    error,
    actions: {
      ...actions,
      createVaccine,
    },
  };
}
