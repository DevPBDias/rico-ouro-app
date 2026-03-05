"use client";

import { useLocalMutation } from "@/hooks/core";
import { SemenDose } from "@/types/semen_dose.type";

export function useUpdateDose() {
  const { loading, error, actions } =
    useLocalMutation<SemenDose>("semen_doses");

  const updateDose = async (
    id: string,
    data: Partial<SemenDose>,
  ): Promise<void> => {
    await actions.update(id, data);
  };

  const updateQuantity = async (
    id: string,
    quantity: number,
  ): Promise<void> => {
    await updateDose(id, { quantity });
  };

  return {
    loading,
    error,
    actions: {
      ...actions,
      updateDose,
      updateQuantity,
    },
  };
}
