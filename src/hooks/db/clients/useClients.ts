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
    data,
    loading: queryLoading,
    error: queryError,
    actions: { refetch },
  } = useLocalQuery<Client>("clients", query);

  const {
    actions: mutationActions,
    loading: mutationLoading,
    error: mutationError,
  } = useLocalMutation<Client>("clients");

  return {
    data: data || [],
    loading: queryLoading || mutationLoading,
    error: queryError || mutationError,
    actions: {
      ...mutationActions,
      createClient: mutationActions.create,
      updateClient: mutationActions.update,
      deleteClient: mutationActions.remove,
      searchClients: setSearchQuery,
      refetch,
    },
  };
}
