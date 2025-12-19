"use client";

import { useLocalMutation } from "@/hooks/core";
import { SemenDose } from "@/types/semen_dose.type";

export function useUpdateDose() {
  const { update, isLoading, error } = useLocalMutation<SemenDose>("semen_doses");

  const updateDose = async (
    id: string,
    data: Partial<SemenDose>
  ): Promise<void> => {
    const updateData: Partial<SemenDose> = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    await update(id, updateData);
  };

  const updateQuantity = async (id: string, quantity: number): Promise<void> => {
    await updateDose(id, { quantity });
  };

  return {
    updateDose,
    updateQuantity,
    isLoading,
    error,
  };
}
