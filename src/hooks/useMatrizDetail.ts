"use client";

import { useMatriz } from "@/hooks/db/useMatriz";
import { useMemo } from "react";

export function useMatrizDetail(uuid: string | null) {
  const { matriz, isLoading, error } = useMatriz(uuid);

  const vacinas = useMemo(() => {
    return (matriz?.vacinas || []).map((v, index) => ({
      uuid: `${uuid}-vac-${index}`,
      nome: v.nome,
      data: v.data,
    }));
  }, [matriz, uuid]);

  return {
    matriz,
    isLoading,
    error,
    vacinas,
  };
}
