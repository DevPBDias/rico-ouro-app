"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useAnimals } from "@/hooks/db";
import { useLocalMutation } from "@/hooks/core";
import { AnimalDocType } from "@/types/database.types";

interface UseBoisListOptions {
  itemsPerPage?: number;
}

export function useBoisList(options: UseBoisListOptions = {}) {
  const { itemsPerPage = 10 } = options;

  const [query, setQuery] = useState("");
  const [sexo, setSexo] = useState("");
  const [parentQuery, setParentQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { animals, isLoading } = useAnimals();

  const { bulkRemove, remove } = useLocalMutation<AnimalDocType>("animals");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pq = parentQuery.trim().toLowerCase();

    return animals.filter((a) => {
      if (q) {
        const rgn = String(a?.animal?.rgn ?? "").toLowerCase();
        const serie = String(a?.animal?.serieRGD ?? "").toLowerCase();
        const nome = String(a?.animal?.nome ?? "").toLowerCase();
        if (!rgn.includes(q) && !serie.includes(q) && !nome.includes(q))
          return false;
      }

      if (sexo && String(a?.animal?.sexo ?? "") !== sexo) return false;

      if (pq) {
        const paiNome = String(a?.pai?.nome ?? "").toLowerCase();
        const maeLabel = `${String(
          a?.mae?.serieRGD ?? ""
        ).toLowerCase()} ${String(a?.mae?.rgn ?? "").toLowerCase()}`.trim();
        if (!paiNome.includes(pq) && !maeLabel.includes(pq)) return false;
      }

      return true;
    });
  }, [animals, query, sexo, parentQuery]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    resetPagination();
  }, [query, sexo, parentQuery, resetPagination]);

  const deleteAllAnimals = useCallback(async () => {
    const uuids = animals
      .map((a) => a.uuid)
      .filter((uuid): uuid is string => uuid !== undefined);

    if (uuids.length > 0) {
      await bulkRemove(uuids);
    }
  }, [animals, bulkRemove]);

  const excluirPorRgn = useCallback(
    async (rgn: string) => {
      const animal = animals.find((a) => a.animal?.rgn === rgn);
      if (animal?.uuid) {
        await remove(animal.uuid);
      }
    },
    [animals, remove]
  );

  return {
    animals,
    filtered,
    paginatedData,
    isLoading,

    currentPage,
    totalPages,
    itemsPerPage,
    handlePageChange,

    deleteAllAnimals,
    excluirPorRgn,

    query,
    setQuery,
    sexo,
    setSexo,
    parentQuery,
    setParentQuery,
  };
}
