"use client";

import { useLocalMutation } from "@/hooks/core";
import { ReproductionEvent } from "@/types/reproduction_event.type";

export function useDeleteReproductionEvent() {
  const { loading, error, actions } = useLocalMutation<ReproductionEvent>(
    "reproduction_events",
  );

  const deleteReproductionEvent = async (id: string): Promise<void> => {
    await actions.remove(id);
  };

  return {
    data: null,
    loading,
    error,
    actions: {
      ...actions,
      deleteReproductionEvent,
    },
  };
}
