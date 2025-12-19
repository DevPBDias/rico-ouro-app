"use client";

import { useState, useMemo, useCallback } from "react";
import { SemenDose } from "@/types/semen_dose.type";
import { v4 as uuidv4 } from "uuid";

interface DoseLocalState {
  editedQuantities: Map<string, number>;
  pendingDeletions: Set<string>;
  newDoses: SemenDose[];
}

interface DoseChanges {
  updates: { id: string; quantity: number }[];
  deletions: string[];
  creations: SemenDose[];
}

export function useDoseLocalState(persistedDoses: SemenDose[]) {
  const [state, setState] = useState<DoseLocalState>({
    editedQuantities: new Map(),
    pendingDeletions: new Set(),
    newDoses: [],
  });

  const displayDoses = useMemo(() => {
    const filtered = persistedDoses.filter(
      (dose) => !state.pendingDeletions.has(dose.id)
    );

    const merged = filtered.map((dose) => ({
      ...dose,
      quantity: state.editedQuantities.has(dose.id)
        ? state.editedQuantities.get(dose.id)!
        : dose.quantity,
    }));

    return [...merged, ...state.newDoses];
  }, [persistedDoses, state]);

  const hasChanges = useMemo(() => {
    return (
      state.editedQuantities.size > 0 ||
      state.pendingDeletions.size > 0 ||
      state.newDoses.length > 0
    );
  }, [state]);

  const changeCount = useMemo(() => {
    return (
      state.editedQuantities.size +
      state.pendingDeletions.size +
      state.newDoses.length
    );
  }, [state]);

  const updateQuantity = useCallback((id: string, newQuantity: number) => {
    setState((prev) => {
      const updated = new Map(prev.editedQuantities);
      updated.set(id, Math.max(0, newQuantity));
      return { ...prev, editedQuantities: updated };
    });
  }, []);

  const incrementQuantity = useCallback((id: string, currentQty: number) => {
    setState((prev) => {
      const updated = new Map(prev.editedQuantities);
      const currentValue = updated.get(id) ?? currentQty;
      updated.set(id, currentValue + 1);
      return { ...prev, editedQuantities: updated };
    });
  }, []);

  const decrementQuantity = useCallback((id: string, currentQty: number) => {
    setState((prev) => {
      const updated = new Map(prev.editedQuantities);
      const currentValue = updated.get(id) ?? currentQty;
      updated.set(id, Math.max(0, currentValue - 1));
      return { ...prev, editedQuantities: updated };
    });
  }, []);

  const incrementBy5 = useCallback((id: string, currentQty: number) => {
    setState((prev) => {
      const updated = new Map(prev.editedQuantities);
      const currentValue = updated.get(id) ?? currentQty;
      updated.set(id, currentValue + 5);
      return { ...prev, editedQuantities: updated };
    });
  }, []);

  const decrementBy5 = useCallback((id: string, currentQty: number) => {
    setState((prev) => {
      const updated = new Map(prev.editedQuantities);
      const currentValue = updated.get(id) ?? currentQty;
      updated.set(id, Math.max(0, currentValue - 5));
      return { ...prev, editedQuantities: updated };
    });
  }, []);

  const markForDeletion = useCallback((id: string) => {
    setState((prev) => {
      const isNewDose = prev.newDoses.some((d) => d.id === id);

      if (isNewDose) {
        return {
          ...prev,
          newDoses: prev.newDoses.filter((d) => d.id !== id),
        };
      }

      const newDeletions = new Set(prev.pendingDeletions);
      newDeletions.add(id);

      const newEdits = new Map(prev.editedQuantities);
      newEdits.delete(id);

      return {
        ...prev,
        pendingDeletions: newDeletions,
        editedQuantities: newEdits,
      };
    });
  }, []);

  const undoDeletion = useCallback((id: string) => {
    setState((prev) => {
      const newDeletions = new Set(prev.pendingDeletions);
      newDeletions.delete(id);
      return { ...prev, pendingDeletions: newDeletions };
    });
  }, []);

  const addLocalDose = useCallback(
    (doseData: Omit<SemenDose, "id" | "updated_at" | "_deleted">) => {
      const newDose: SemenDose = {
        id: uuidv4(),
        ...doseData,
        updated_at: new Date().toISOString(),
        _deleted: false,
      };

      setState((prev) => ({
        ...prev,
        newDoses: [...prev.newDoses, newDose],
      }));

      return newDose;
    },
    []
  );

  const revert = useCallback(() => {
    setState({
      editedQuantities: new Map(),
      pendingDeletions: new Set(),
      newDoses: [],
    });
  }, []);

  const getChanges = useCallback((): DoseChanges => {
    return {
      updates: Array.from(state.editedQuantities.entries()).map(
        ([id, qty]) => ({
          id,
          quantity: qty,
        })
      ),
      deletions: Array.from(state.pendingDeletions),
      creations: state.newDoses,
    };
  }, [state]);

  const clearAfterSave = useCallback(() => {
    setState({
      editedQuantities: new Map(),
      pendingDeletions: new Set(),
      newDoses: [],
    });
  }, []);

  return {
    displayDoses,
    hasChanges,
    changeCount,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    incrementBy5,
    decrementBy5,
    markForDeletion,
    undoDeletion,
    addLocalDose,
    revert,
    getChanges,
    clearAfterSave,
  };
}
