"use client";

import { useLocalDocument } from "@/hooks/core";
import { Client } from "@/types/client.type";

/**
 * Hook reativo para obter um cliente específico pelo ID.
 */
export function useClientById(id: string) {
  const { data, loading, error, actions } = useLocalDocument<Client>(
    "clients",
    id,
  );

  return {
    data,
    loading,
    error,
    actions,
  };
}
