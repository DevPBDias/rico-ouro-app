"use client";

import { useLocalMutation } from "@/hooks/core";
import { ReproductionEvent } from "@/types/reproduction_event.type";

export function useCreateReproductionEvent() {
  const { create, isLoading, error } = useLocalMutation<ReproductionEvent>("reproduction_events");

  const createEvent = async (data: Partial<ReproductionEvent>): Promise<ReproductionEvent> => {
    return await create(data);
  };

  return {
    createEvent,
    isLoading,
    error,
  };
}
