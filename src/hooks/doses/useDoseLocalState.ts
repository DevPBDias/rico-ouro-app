"use client";

import { useState, useMemo, useCallback } from "react";
import { SemenDose } from "@/types/semen_dose.type";
import { v4 as uuidv4 } from "uuid";

interface DoseLocalState {
  editedDoses: Map<string, Partial<SemenDose>>;
  pendingDeletions: Set<string>;
  newDoses: SemenDose[];
}

interface DoseChanges {
  updates: (Partial<SemenDose> & { id: string })[];
  deletions: string[];
  creations: SemenDose[];
}

export function useDoseLocalState(persistedDoses: SemenDose[]) {
  const [state, setState] = useState<DoseLocalState>({
    editedDoses: new Map(),
    pendingDeletions: new Set(),
    newDoses: [],
  });

  const displayDoses = useMemo(() => {
    // 1. Filter out deleted doses
    const filtered = persistedDoses.filter(
      (dose) => !state.pendingDeletions.has(dose.id)
    );

    // 2. Apply local edits to persisted doses
    const merged = filtered.map((dose) => {
      if (state.editedDoses.has(dose.id)) {
        return {
          ...dose,
          ...state.editedDoses.get(dose.id)!,
        };
      }
      return dose;
    });

    // 3. Add brand new doses (and filter out if they were deleted/removed)
    const newDosesFiltered = state.newDoses.filter(
      (dose) => !state.pendingDeletions.has(dose.id)
    );

    return [...merged, ...newDosesFiltered];
  }, [persistedDoses, state]);

  const hasChanges = useMemo(() => {
    return (
      state.editedDoses.size > 0 ||
      state.pendingDeletions.size > 0 ||
      state.newDoses.length > 0
    );
  }, [state]);

  const changeCount = useMemo(() => {
    return (
      state.editedDoses.size +
      state.pendingDeletions.size +
      state.newDoses.length
    );
  }, [state]);

  const updateQuantity = useCallback((id: string, newQuantity: number) => {
    setState((prev) => {
      // Check if it's a new dose
      const newDoseIdx = prev.newDoses.findIndex((d) => d.id === id);
      if (newDoseIdx !== -1) {
        const updatedNewDoses = [...prev.newDoses];
        updatedNewDoses[newDoseIdx] = {
          ...updatedNewDoses[newDoseIdx],
          quantity: Math.max(0, newQuantity),
          updated_at: new Date().toISOString(),
        };
        return { ...prev, newDoses: updatedNewDoses };
      }

      // It's a persisted dose
      const updated = new Map(prev.editedDoses);
      const existingEdit = updated.get(id) || {};
      updated.set(id, { ...existingEdit, quantity: Math.max(0, newQuantity) });
      return { ...prev, editedDoses: updated };
    });
  }, []);

  const updateLocalDose = useCallback(
    (id: string, data: Partial<SemenDose>) => {
      setState((prev) => {
        // Check if it's a new dose
        const newDoseIdx = prev.newDoses.findIndex((d) => d.id === id);
        if (newDoseIdx !== -1) {
          const updatedNewDoses = [...prev.newDoses];
          updatedNewDoses[newDoseIdx] = {
            ...updatedNewDoses[newDoseIdx],
            ...data,
            updated_at: new Date().toISOString(),
          };
          return { ...prev, newDoses: updatedNewDoses };
        }

        // It's a persisted dose
        const updated = new Map(prev.editedDoses);
        const existingEdit = updated.get(id) || {};
        updated.set(id, { ...existingEdit, ...data });
        return { ...prev, editedDoses: updated };
      });
    },
    []
  );

  const incrementQuantity = useCallback(
    (id: string, currentQty: number) => {
      updateQuantity(id, currentQty + 1);
    },
    [updateQuantity]
  );

  const decrementQuantity = useCallback(
    (id: string, currentQty: number) => {
      updateQuantity(id, Math.max(0, currentQty - 1));
    },
    [updateQuantity]
  );

  const incrementBy5 = useCallback(
    (id: string, currentQty: number) => {
      updateQuantity(id, currentQty + 5);
    },
    [updateQuantity]
  );

  const decrementBy5 = useCallback(
    (id: string, currentQty: number) => {
      updateQuantity(id, Math.max(0, currentQty - 5));
    },
    [updateQuantity]
  );

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

      const newEdits = new Map(prev.editedDoses);
      newEdits.delete(id);

      return {
        ...prev,
        pendingDeletions: newDeletions,
        editedDoses: newEdits,
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
      editedDoses: new Map(),
      pendingDeletions: new Set(),
      newDoses: [],
    });
  }, []);

  const getChanges = useCallback((): DoseChanges => {
    return {
      updates: Array.from(state.editedDoses.entries()).map(([id, data]) => ({
        ...data,
        id,
      })),
      deletions: Array.from(state.pendingDeletions),
      creations: state.newDoses,
    };
  }, [state]);

  const clearAfterSave = useCallback(() => {
    setState({
      editedDoses: new Map(),
      pendingDeletions: new Set(),
      newDoses: [],
    });
  }, []);

  return {
    displayDoses,
    hasChanges,
    changeCount,
    updateQuantity,
    updateLocalDose,
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
