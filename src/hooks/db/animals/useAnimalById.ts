"use client";

import { useLocalDocument } from "@/hooks/core/useLocalDocument";
import { Animal } from "@/types/animal.type";

export function useAnimalById(rgn: string | null) {
  const { data, loading, error, actions } = useLocalDocument<Animal>(
    "animals",
    rgn,
  );

  return {
    data,
    loading,
    error,
    actions,
  };
}
