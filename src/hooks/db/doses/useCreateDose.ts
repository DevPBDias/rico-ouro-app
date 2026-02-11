"use client";

import { useLocalMutation } from "@/hooks/core";
import { SemenDose } from "@/types/semen_dose.type";
import { v4 as uuidv4 } from "uuid";

export function useCreateDose() {
  const { create, isLoading, error } = useLocalMutation<SemenDose>("semen_doses");

  const createDose = async (
    data: Omit<SemenDose, "id" | "updated_at" | "_deleted" | "created_at">,
  ): Promise<SemenDose> => {
    const newDose: Partial<SemenDose> = {
      id: uuidv4(),
      ...data,
    };

    return await create(newDose);
  };

  return {
    createDose,
    isLoading,
    error,
  };
}
