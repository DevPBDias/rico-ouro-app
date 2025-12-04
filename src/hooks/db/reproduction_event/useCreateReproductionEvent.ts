"use client";

import { useLocalMutation } from "@/hooks/core";
import { ReproductionEvent } from "@/types/reproduction_event.type";

import { v4 as uuidv4 } from "uuid";

export function useCreateReproductionEvent() {
  const { create, isLoading, error } = useLocalMutation<ReproductionEvent>(
    "reproduction_events"
  );

  const createEvent = async (
    data: Partial<ReproductionEvent>
  ): Promise<ReproductionEvent> => {
    const eventData = {
      ...data,
      id: data.id || uuidv4(),
    };
    return await create(eventData);
  };

  return {
    createEvent,
    isLoading,
    error,
  };
}
