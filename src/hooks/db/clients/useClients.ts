"use client";

import { useLocalQuery, useLocalMutation } from "@/hooks/core";
import { Client } from "@/types/client.type";
import { useMemo, useState } from "react";
import type { MangoQuery } from "rxdb";

/**
 * Hook reativo para gerenciar a lista de clientes.
 * Oferece busca, ordenação e operações CRUD básicas.
 */
export function useClients() {
  const [searchQuery, setSearchQuery] = useState("");

  const query = useMemo<MangoQuery<Client>>(() => {
    const baseSelector: any = { _deleted: { $eq: false } };

    if (searchQuery) {
      // Usamos string para o $regex para garantir que o JSON.stringify no useLocalQuery funcione corretamente
      baseSelector.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { cpf_cnpj: { $regex: searchQuery, $options: "i" } },
      ];
    }

    return {
      selector: baseSelector,
      sort: [{ name: "asc" } as any],
    };
  }, [searchQuery]);

  const {
    data: clients,
    isLoading: isQueryLoading,
    error: queryError,
    refetch,
  } = useLocalQuery<Client>("clients", query);

  const {
    create,
    update,
    remove,
    isLoading: isMutationLoading,
    error: mutationError,
  } = useLocalMutation<Client>("clients");

  return {
    clients: clients || [],
    isLoading: isQueryLoading || isMutationLoading,
    error: queryError || mutationError,
    createClient: create,
    updateClient: update,
    deleteClient: remove,
    searchClients: setSearchQuery,
    refetch,
  };
}
