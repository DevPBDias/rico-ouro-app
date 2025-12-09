"use client";

import { useLocalMutation } from "@/hooks/core";
import { ReproductionEvent } from "@/types/reproduction_event.type";

export function useUpdateReproductionEvent() {
  const { update, isLoading, error } = useLocalMutation<ReproductionEvent>("reproduction_events");

  const updateEvent = async (
    id: string,
    data: Partial<ReproductionEvent>
  ): Promise<void> => {
    await update(id, data);
  };

  return {
    updateEvent,
    isLoading,
    error,
  };
}
