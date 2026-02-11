"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalSituation } from "@/types/situation.type";
import { v4 as uuidv4 } from "uuid";

export function useCreateSituation() {
  const { create, isLoading, error } = useLocalMutation<AnimalSituation>("animal_situations");

  const createSituation = async (data: Partial<AnimalSituation>): Promise<AnimalSituation> => {
    const situationData = {
      ...data,
      id: data.id || uuidv4(),
    };
    return await create(situationData);
  };

  return {
    createSituation,
    isLoading,
    error,
  };
}
