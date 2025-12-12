"use client";

import { useCacheDynamicRoutes, routePatterns } from "./useCacheDynamicRoutes";

export function usePrecacheAnimalDetails(
  animals: Array<{ id?: string; rgn?: string }> | undefined | null,
  type: "animals" | "matrizes" = "animals"
) {
  const ids =
    animals
      ?.map((a) => a.id || a.rgn)
      .filter((id): id is string => Boolean(id)) || [];

  const routePattern =
    type === "animals" ? routePatterns.animals : routePatterns.matrizes;

  return useCacheDynamicRoutes(ids, routePattern, type);
}
