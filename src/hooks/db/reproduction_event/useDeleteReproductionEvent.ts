"use client";

import { useLocalMutation } from "@/hooks/core";
import { ReproductionEvent } from "@/types/reproduction_event.type";

export function useDeleteReproductionEvent() {
  const { remove, isLoading, error } = useLocalMutation<ReproductionEvent>("reproduction_events");

  const deleteEvent = async (id: number): Promise<void> => {
    await remove(id.toString());
  };

  return {
    deleteEvent,
    isLoading,
    error,
  };
}
