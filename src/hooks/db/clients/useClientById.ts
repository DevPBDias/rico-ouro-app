"use client";

import { useLocalDocument } from "@/hooks/core";
import { Client } from "@/types/client.type";

/**
 * Hook reativo para obter um cliente específico pelo ID.
 */
export function useClientById(id: string) {
  const {
    data: client,
    isLoading,
    error,
  } = useLocalDocument<Client>("clients", id);

  return {
    client,
    isLoading,
    error,
  };
}
