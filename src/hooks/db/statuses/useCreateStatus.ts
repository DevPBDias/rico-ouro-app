"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalStatus } from "@/types/status.type";
import { v4 as uuidv4 } from "uuid";

export function useCreateStatus() {
  const { loading, error, actions } =
    useLocalMutation<AnimalStatus>("animal_statuses");

  const createStatus = async (
    data: Omit<AnimalStatus, "id" | "updated_at" | "_deleted" | "created_at">,
  ): Promise<AnimalStatus> => {
    const newStatus: Partial<AnimalStatus> = {
      id: uuidv4(),
      ...data,
    };

    return await actions.create(newStatus);
  };

  return {
    loading,
    error,
    actions: {
      ...actions,
      createStatus,
    },
  };
}
