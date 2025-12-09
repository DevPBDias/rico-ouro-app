"use client";

import { useLocalMutation } from "@/hooks/core";
import { ReproductionEvent } from "@/types/reproduction_event.type";

export function useDeleteReproductionEvent() {
  const { remove, isLoading, error } = useLocalMutation<ReproductionEvent>("reproduction_events");

  const deleteEvent = async (id: string): Promise<void> => {
    await remove(id);
  };

  return {
    deleteEvent,
    isLoading,
    error,
  };
}
