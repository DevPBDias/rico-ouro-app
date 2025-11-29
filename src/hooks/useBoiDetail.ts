"use client";

import { useCallback, useMemo } from "react";
import { useAnimal } from "@/hooks/db/useAnimal";
import { useUpdateAnimal } from "@/hooks/db/useUpdateAnimal";

export function useBoiDetail(uuid: string | null) {
  const { animal: boi, isLoading, error } = useAnimal(uuid);
  const { updateAnimal } = useUpdateAnimal();

  // 🔹 Pesos
  const addPeso = useCallback(async () => {
    if (!uuid || !boi) return;

    const now = new Date();
    const date = now.toISOString().split("T")[0];

    const currentPesos = boi.animal?.pesosMedidos || [];
    await updateAnimal(uuid, {
      animal: {
        ...boi.animal,
        pesosMedidos: [...currentPesos, { mes: date, valor: 0 }],
      },
      updatedAt: now.toISOString(),
    });
  }, [boi, uuid, updateAnimal]);

  const savePesoComMes = useCallback(
    async (date: string, value: string | number) => {
      if (!uuid || !boi) return;

      const currentPesos = boi.animal?.pesosMedidos || [];
      await updateAnimal(uuid, {
        animal: {
          ...boi.animal,
          pesosMedidos: [...currentPesos, { mes: date, valor: Number(value) }],
        },
        updatedAt: new Date().toISOString(),
      });
    },
    [boi, uuid, updateAnimal]
  );

  const editPeso = useCallback(
    async (index: number, valor: string) => {
      if (!uuid || !boi) return;

      const currentPesos = boi.animal?.pesosMedidos || [];
      const updatedPesos = [...currentPesos];
      if (updatedPesos[index]) {
        updatedPesos[index] = { ...updatedPesos[index], valor: Number(valor) };
      }

      await updateAnimal(uuid, {
        animal: {
          ...boi.animal,
          pesosMedidos: updatedPesos,
        },
        updatedAt: new Date().toISOString(),
      });
    },
    [boi, uuid, updateAnimal]
  );

  const deletePeso = useCallback(
    async (index: number) => {
      if (!uuid || !boi) return;

      const currentPesos = boi.animal?.pesosMedidos || [];
      const updatedPesos = currentPesos.filter((_, i) => i !== index);

      await updateAnimal(uuid, {
        animal: {
          ...boi.animal,
          pesosMedidos: updatedPesos,
        },
        updatedAt: new Date().toISOString(),
      });
    },
    [boi, uuid, updateAnimal]
  );

  // 🔹 Circunferência
  const addCirc = useCallback(async () => {
    if (!uuid || !boi) return;

    const now = new Date();
    const date = now.toISOString().split("T")[0];

    const currentCirc = boi.animal?.circunferenciaEscrotal || [];
    await updateAnimal(uuid, {
      animal: {
        ...boi.animal,
        circunferenciaEscrotal: [...currentCirc, { mes: date, valor: 0 }],
      },
      updatedAt: now.toISOString(),
    });
  }, [boi, uuid, updateAnimal]);

  const saveCircComMes = useCallback(
    async (date: string, value: string | number) => {
      if (!uuid || !boi) return;

      const currentCirc = boi.animal?.circunferenciaEscrotal || [];
      await updateAnimal(uuid, {
        animal: {
          ...boi.animal,
          circunferenciaEscrotal: [
            ...currentCirc,
            { mes: date, valor: Number(value) },
          ],
        },
        updatedAt: new Date().toISOString(),
      });
    },
    [boi, uuid, updateAnimal]
  );

  const editCirc = useCallback(
    async (index: number, valor: string) => {
      if (!uuid || !boi) return;

      const currentCirc = boi.animal?.circunferenciaEscrotal || [];
      const updatedCirc = [...currentCirc];
      if (updatedCirc[index]) {
        updatedCirc[index] = { ...updatedCirc[index], valor: Number(valor) };
      }

      await updateAnimal(uuid, {
        animal: {
          ...boi.animal,
          circunferenciaEscrotal: updatedCirc,
        },
        updatedAt: new Date().toISOString(),
      });
    },
    [boi, uuid, updateAnimal]
  );

  const deleteCirc = useCallback(
    async (index: number) => {
      if (!uuid || !boi) return;

      const currentCirc = boi.animal?.circunferenciaEscrotal || [];
      const updatedCirc = currentCirc.filter((_, i) => i !== index);

      await updateAnimal(uuid, {
        animal: {
          ...boi.animal,
          circunferenciaEscrotal: updatedCirc,
        },
        updatedAt: new Date().toISOString(),
      });
    },
    [boi, uuid, updateAnimal]
  );

  // Mapeia para o formato esperado pela UI (compatibilidade)
  const pesosMedidos = useMemo(() => {
    return (boi?.animal?.pesosMedidos || []).map((w, index) => ({
      uuid: `${uuid}-peso-${index}`, // Gera um ID único para compatibilidade
      mes: w.mes,
      valor: w.valor,
    }));
  }, [boi, uuid]);

  const circunferenciaEscrotal = useMemo(() => {
    return (boi?.animal?.circunferenciaEscrotal || []).map((s, index) => ({
      uuid: `${uuid}-circ-${index}`,
      mes: s.mes,
      valor: s.valor,
    }));
  }, [boi, uuid]);

  const vacinas = useMemo(() => {
    return (boi?.animal?.vacinas || []).map((v, index) => ({
      uuid: `${uuid}-vac-${index}`,
      nome: v.nome,
      data: v.data,
    }));
  }, [boi, uuid]);

  return {
    boi,
    isLoading,
    error,
    pesosMedidos,
    circunferenciaEscrotal,
    vacinas,
    addPeso,
    savePesoComMes,
    editPeso,
    deletePeso,
    addCirc,
    saveCircComMes,
    editCirc,
    deleteCirc,
    updateFullAnimal: useCallback(
      async (
        updatedData: Partial<import("@/types/schemas.types").AnimalData>
      ) => {
        if (!uuid) return;
        await updateAnimal(uuid, updatedData);
      },
      [uuid, updateAnimal]
    ),
  };
}
