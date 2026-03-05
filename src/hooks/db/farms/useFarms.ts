"use client";

import { useMemo } from "react";
import { useLocalQuery, useLocalMutation } from "@/hooks/core";
import { Farm } from "@/types/farm.type";

export function useFarms() {
  const query = useMemo(
    () => ({
      selector: {
        _deleted: { $eq: false },
      },
      sort: [{ farm_name: "asc" } as any],
    }),
    [],
  );

  const {
    data,
    loading,
    error,
    actions: queryActions,
  } = useLocalQuery<Farm>("farms", query);
  const { actions: mutationActions, loading: mutationLoading } =
    useLocalMutation<Farm>("farms");

  const createFarm = async (farmName: string) => {
    return await mutationActions.create({
      farm_name: farmName,
    } as any);
  };

  const updateFarm = async (id: string, farmName: string) => {
    return await mutationActions.update(id, {
      farm_name: farmName,
    } as any);
  };

  const deleteFarm = async (id: string) => {
    return await mutationActions.remove(id);
  };

  return {
    data,
    loading: loading || mutationLoading,
    error,
    actions: {
      ...queryActions,
      ...mutationActions,
      createFarm,
      updateFarm,
      deleteFarm,
    },
  };
}
