"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { db, AnimalData } from "@/lib/db";
import { calcularGanhoDiario } from "@/utils/gainDaily";

export function useBoiDetail(id: number | null) {
  const [boi, setBoi] = useState<AnimalData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const load = useCallback(async () => {
    if (id == null || Number.isNaN(id)) {
      setBoi(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const found = await db.animalData.get(id);
    setBoi(found ?? null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const salvar = useCallback(
    async (partialAnimal: Partial<AnimalData["animal"]>) => {
      if (!boi?.id) return;
      const next: AnimalData = {
        ...boi,
        animal: {
          ...(boi.animal ?? {}),
          ...partialAnimal,
          pesosMedidos:
            partialAnimal.pesosMedidos !== undefined
              ? partialAnimal.pesosMedidos
              : boi.animal.pesosMedidos ?? [],
          circunferenciaEscrotal:
            partialAnimal.circunferenciaEscrotal !== undefined
              ? partialAnimal.circunferenciaEscrotal
              : boi.animal.circunferenciaEscrotal ?? [],
          ganhoDiario:
            partialAnimal.pesosMedidos !== undefined
              ? calcularGanhoDiario(partialAnimal.pesosMedidos)
              : boi.animal.ganhoDiario ?? [],
          updatedAt: new Date().toISOString(),
        },
      };
      await db.animalData.put(next);
      setBoi(next);
    },
    [boi]
  );

  // 🔹 Pesos
  const addPeso = useCallback(async () => {
    if (!boi) return;
    const now = new Date();
    const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;
    const novo = [...(boi.animal.pesosMedidos ?? []), { mes, valor: 0 }];
    await salvar({ pesosMedidos: novo });
  }, [boi, salvar]);

  const savePesoComMes = useCallback(
    async (mes: string, valor: string | number) => {
      if (!boi) return;
      const atual = boi.animal.pesosMedidos ?? [];
      const novo = [...atual, { mes, valor: Number(valor) }];
      await salvar({ pesosMedidos: novo });
    },
    [boi, salvar]
  );

  const editPeso = useCallback(
    async (index: number, valor: string) => {
      if (!boi) return;
      const novo = [...(boi.animal.pesosMedidos ?? [])];
      const current = novo[index] ?? { mes: "", valor: 0 };
      novo[index] = { ...current, valor: Number(valor) };
      await salvar({ pesosMedidos: novo });
    },
    [boi, salvar]
  );

  const deletePeso = useCallback(
    async (index: number) => {
      if (!boi) return;
      const novo = (boi.animal.pesosMedidos ?? []).filter(
        (_, i) => i !== index
      );
      await salvar({ pesosMedidos: novo });
    },
    [boi, salvar]
  );

  // 🔹 Circunferência
  const addCirc = useCallback(async () => {
    if (!boi) return;
    const now = new Date();
    const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;
    const novo = [
      ...(boi.animal.circunferenciaEscrotal ?? []),
      { mes, valor: 0 },
    ];
    await salvar({ circunferenciaEscrotal: novo });
  }, [boi, salvar]);

  const saveCircComMes = useCallback(
    async (mes: string, valor: string | number) => {
      if (!boi) return;
      const atual = boi.animal.circunferenciaEscrotal ?? [];
      const novo = [...atual, { mes, valor: Number(valor) }];
      await salvar({ circunferenciaEscrotal: novo });
    },
    [boi, salvar]
  );

  const editCirc = useCallback(
    async (index: number, valor: string) => {
      if (!boi) return;
      const novo = [...(boi.animal.circunferenciaEscrotal ?? [])];
      const current = novo[index] ?? { mes: "", valor: 0 };
      novo[index] = { ...current, valor: Number(valor) };
      await salvar({ circunferenciaEscrotal: novo });
    },
    [boi, salvar]
  );

  const deleteCirc = useCallback(
    async (index: number) => {
      if (!boi) return;
      const novo = (boi.animal.circunferenciaEscrotal ?? []).filter(
        (_, i) => i !== index
      );
      await salvar({ circunferenciaEscrotal: novo });
    },
    [boi, salvar]
  );

  const pesosMedidos = useMemo(() => boi?.animal.pesosMedidos ?? [], [boi]);
  const circunferenciaEscrotal = useMemo(
    () => boi?.animal.circunferenciaEscrotal ?? [],
    [boi]
  );

  return {
    boi,
    loading,
    reload: load,
    salvar,
    pesosMedidos,
    circunferenciaEscrotal,
    addPeso,
    savePesoComMes,
    editPeso,
    deletePeso,
    addCirc,
    saveCircComMes,
    editCirc,
    deleteCirc,
  };
}
