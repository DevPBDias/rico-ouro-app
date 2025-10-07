"use client";

import { useMemo, useState, useEffect } from "react";
import { useAnimalDB } from "@/hooks/useAnimalDB";

interface UseBoisListOptions {
  itemsPerPage?: number;
}

export function useBoisList(options: UseBoisListOptions = {}) {
  const { itemsPerPage = 10 } = options;
  const { dados, limpar, excluirPorRgn } = useAnimalDB();

  const [query, setQuery] = useState("");
  const [sexo, setSexo] = useState("");
  const [parentQuery, setParentQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pq = parentQuery.trim().toLowerCase();
    return dados.filter((a) => {
      if (q) {
        const rgn = String(a.animal.rgn ?? "").toLowerCase();
        const serie = String(a.animal.serieRGD ?? "").toLowerCase();
        if (!rgn.includes(q) && !serie.includes(q)) return false;
      }
      if (sexo && String(a.animal.sexo ?? "") !== sexo) return false;
      if (pq) {
        const paiNome = String(a.pai?.nome ?? "").toLowerCase();
        const maeLabel = `${String(
          a.mae?.serieRGD ?? ""
        ).toLowerCase()} ${String(a.mae?.rgn ?? "").toLowerCase()}`.trim();
        if (!paiNome.includes(pq) && !maeLabel.includes(pq)) return false;
      }
      return true;
    });
  }, [dados, query, sexo, parentQuery]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Reset pagination when filters change
  useEffect(() => {
    resetPagination();
  }, [query, sexo, parentQuery]);

  return {
    dados,
    filtered,
    paginatedData,
    currentPage,
    totalPages,
    itemsPerPage,
    handlePageChange,
    limpar,
    excluirPorRgn,
    query,
    setQuery,
    sexo,
    setSexo,
    parentQuery,
    setParentQuery,
  };
}
