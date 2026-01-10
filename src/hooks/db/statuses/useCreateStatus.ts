"use client";

import { useLocalMutation } from "@/hooks/core";
import { AnimalStatus } from "@/types/status.type";
import { v4 as uuidv4 } from "uuid";

export function useCreateStatus() {
  const { create, isLoading, error } = useLocalMutation<AnimalStatus>("animal_statuses");

  const createStatus = async (data: Partial<AnimalStatus>): Promise<AnimalStatus> => {
    const statusData = {
      ...data,
      id: data.id || uuidv4(),
      _deleted: false,
    };
    return await create(statusData);
  };

  return {
    createStatus,
    isLoading,
    error,
  };
}
