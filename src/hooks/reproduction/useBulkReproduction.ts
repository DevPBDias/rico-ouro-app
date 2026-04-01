"use client";

import { useState, useMemo } from "react";
import { Animal } from "@/types/animal.type";
import { EventType, ReproductionEvent } from "@/types/reproduction_event.type";
import {
  BulkReproductionPayload,
  BulkReproductionResult,
  createBulkReproductionEvents,
  syncReproductionEventsByIds,
} from "@/lib/services/reproduction";

export type BulkReproductionStatus =
  | "pending"
  | "syncing"
  | "success"
  | "error";

export function useBulkReproduction() {
  const [selectedCows, setSelectedCows] = useState<Animal[]>([]);
  const [checkedCowRgns, setCheckedCowRgns] = useState<Set<string>>(new Set());
  const [statusMap, setStatusMap] = useState<Record<string, BulkReproductionStatus>>(
    {},
  );
  const [failedEventIds, setFailedEventIds] = useState<string[]>([]);
  const [failedCowRgns, setFailedCowRgns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCount = selectedCows.length;
  const completedCount = useMemo(
    () =>
      Object.values(statusMap).filter((status) => status === "success").length,
    [statusMap],
  );
  const progressPercentage = selectedCount
    ? Math.round((completedCount / selectedCount) * 100)
    : 0;
  const hasErrors = Object.values(statusMap).some(
    (status) => status === "error",
  );

  const addCow = (cow: Animal): boolean => {
    if (selectedCows.some((item) => item.rgn === cow.rgn)) {
      return false;
    }

    setSelectedCows((prev) => [cow, ...prev]);
    return true;
  };

  const removeCow = (rgn: string) => {
    setSelectedCows((prev) => prev.filter((cow) => cow.rgn !== rgn));
    setCheckedCowRgns((prev) => {
      const next = new Set(prev);
      next.delete(rgn);
      return next;
    });
    setStatusMap((prev) => {
      const next = { ...prev };
      delete next[rgn];
      return next;
    });
  };

  const clearCows = () => {
    setSelectedCows([]);
    setCheckedCowRgns(new Set());
    setStatusMap({});
    setFailedEventIds([]);
    setFailedCowRgns([]);
    setError(null);
  };

  const toggleCowSelection = (rgn: string) => {
    setCheckedCowRgns((prev) => {
      const next = new Set(prev);
      if (next.has(rgn)) {
        next.delete(rgn);
      } else {
        next.add(rgn);
      }
      return next;
    });
  };

  const removeSelectedCows = () => {
    if (checkedCowRgns.size === 0) {
      return;
    }

    setSelectedCows((prev) =>
      prev.filter((cow) => !checkedCowRgns.has(cow.rgn)),
    );
    setCheckedCowRgns(new Set());
    setStatusMap((prev) => {
      const next = { ...prev };
      checkedCowRgns.forEach((rgn) => delete next[rgn]);
      return next;
    });
  };

  const initializeStatuses = (status: BulkReproductionStatus) => {
    const nextStatuses: Record<string, BulkReproductionStatus> = {};
    selectedCows.forEach((cow) => {
      nextStatuses[cow.rgn] = status;
    });
    setStatusMap(nextStatuses);
  };

  const createEvents = async (
    payload: BulkReproductionPayload,
  ): Promise<BulkReproductionResult> => {
    if (selectedCows.length === 0) {
      const result: BulkReproductionResult = {
        insertedEvents: [],
        synced: false,
        error: "Nenhuma matriz selecionada.",
      };
      setError(result.error ?? null);
      return result;
    }

    setError(null);
    setIsProcessing(true);
    initializeStatuses("syncing");

    try {
      const result = await createBulkReproductionEvents(
        selectedCows,
        payload,
      );

      const nextStatus = selectedCows.reduce<Record<string, BulkReproductionStatus>>(
        (acc, cow) => {
          acc[cow.rgn] = result.synced ? "success" : "error";
          return acc;
        },
        {},
      );

      setStatusMap(nextStatus);
      setFailedEventIds(result.synced ? [] : result.insertedEvents.map((event) => event.event_id));
      setFailedCowRgns(result.synced ? [] : selectedCows.map((cow) => cow.rgn));
      setError(result.error ?? null);

      if (result.synced) {
        clearCows();
      }

      return result;
    } finally {
      setIsProcessing(false);
    }
  };

  const retryFailedSync = async (): Promise<BulkReproductionResult> => {
    if (failedEventIds.length === 0) {
      return {
        insertedEvents: [],
        synced: true,
      };
    }

    setError(null);
    setIsProcessing(true);
    setStatusMap((prev) => {
      const next = { ...prev };
      failedCowRgns.forEach((rgn) => {
        if (next[rgn] !== "success") {
          next[rgn] = "syncing";
        }
      });
      return next;
    });

    try {
      const result = await syncReproductionEventsByIds(failedEventIds);
      const nextStatus = selectedCows.reduce<Record<string, BulkReproductionStatus>>(
        (acc, cow) => {
          if (failedCowRgns.includes(cow.rgn)) {
            acc[cow.rgn] = result.synced ? "success" : "error";
          } else {
            acc[cow.rgn] = statusMap[cow.rgn] ?? "pending";
          }
          return acc;
        },
        {},
      );

      setStatusMap(nextStatus);
      if (result.synced) {
        setFailedEventIds([]);
        setFailedCowRgns([]);
        clearCows();
      }
      setError(result.error ?? null);
      return result;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    selectedCows,
    selectedCount,
    checkedCowRgns,
    statusMap,
    addCow,
    removeCow,
    clearCows,
    toggleCowSelection,
    removeSelectedCows,
    createEvents,
    retryFailedSync,
    isProcessing,
    error,
    hasErrors,
    progressPercentage,
    failedCowRgns,
    failedEventIds,
  };
}
