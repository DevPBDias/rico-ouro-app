"use client";

import { useLocalMutation } from "@/hooks/core";
import { ReproductionEvent } from "@/types/reproduction_event.type";

export function useUpdateReproductionEvent() {
  const { loading, error, actions } = useLocalMutation<ReproductionEvent>(
    "reproduction_events",
  );

  const updateReproductionEvent = async (
    id: string,
    data: Partial<ReproductionEvent>,
  ): Promise<void> => {
    await actions.update(id, data);
  };

  return {
    data: null,
    loading,
    error,
    actions: {
      ...actions,
      updateReproductionEvent,
    },
  };
}
