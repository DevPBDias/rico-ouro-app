"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useLocalMutation } from "@/hooks/core";
import { useAnimals } from "./useAnimals";
import { Animal } from "@/types/animal.type";

interface UseAnimalsListOptions {
  itemsPerPage?: number;
}

export function useAnimalsList(options: UseAnimalsListOptions = {}) {
  const { itemsPerPage = 10 } = options;

  const [query, setQuery] = useState("");
  const [sexo, setSexo] = useState("");
  const [parentQuery, setParentQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { animals, isLoading } = useAnimals();

  const { bulkRemove, remove } = useLocalMutation<Animal>("animals");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pq = parentQuery.trim().toLowerCase();

    return animals.filter((a) => {
      if (q) {
        const rgn = String(a?.rgn ?? "").toLowerCase();
        const serie = String(a?.serie_rgd ?? "").toLowerCase();
        const nome = String(a?.name ?? "").toLowerCase();
        if (!rgn.includes(q) && !serie.includes(q) && !nome.includes(q))
          return false;
      }

      if (sexo && String(a?.sex ?? "") !== sexo) return false;

      if (pq) {
        const paiNome = String(a?.father_name ?? "").toLowerCase();
        const maeLabel = `${String(
          a?.mother_serie_rgd ?? ""
        ).toLowerCase()} ${String(a?.mother_rgn ?? "").toLowerCase()}`.trim();
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
    const rgns = animals
      .map((a) => a.rgn)
      .filter((rgn): rgn is string => rgn !== undefined);

    if (rgns.length > 0) {
      await bulkRemove(rgns);
    }
  }, [animals, bulkRemove]);

  const excluirPorRgn = useCallback(
    async (rgn: string) => {
      const animal = animals.find((a) => a.rgn === rgn);
      if (animal?.rgn) {
        await remove(animal.rgn);
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
