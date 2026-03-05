"use client";

import { useMemo } from "react";
import { useLocalQuery, useLocalMutation } from "@/hooks/core";
import { Vaccine } from "@/types/vaccine.type";

export function useVaccines() {
  const query = useMemo(
    () => ({
      selector: {
        _deleted: { $eq: false },
      },
      sort: [{ vaccine_name: "asc" } as any],
    }),
    [],
  );

  const {
    data,
    loading,
    error,
    actions: queryActions,
  } = useLocalQuery<Vaccine>("vaccines", query);
  const { actions: mutationActions, loading: mutationLoading } =
    useLocalMutation<Vaccine>("vaccines");

  const createVaccine = async (vaccineName: string) => {
    return await mutationActions.create({
      vaccine_name: vaccineName,
    } as any);
  };

  const updateVaccine = async (id: string, vaccineName: string) => {
    return await mutationActions.update(id, {
      vaccine_name: vaccineName,
    } as any);
  };

  const deleteVaccine = async (id: string) => {
    return await mutationActions.remove(id);
  };

  return {
    data,
    loading: loading || mutationLoading,
    error,
    actions: {
      ...queryActions,
      ...mutationActions,
      createVaccine,
      updateVaccine,
      deleteVaccine,
    },
  };
}
