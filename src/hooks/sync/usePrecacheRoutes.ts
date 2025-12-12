"use client";

import { useCacheDynamicRoutes, routePatterns } from "./useCacheDynamicRoutes";

export function usePrecacheAnimalDetails(
  animals: Array<{ id?: string; rgn?: string }> | undefined | null,
  type: "bois" | "matrizes" = "bois"
) {
  const ids =
    animals
      ?.map((a) => a.id || a.rgn)
      .filter((id): id is string => Boolean(id)) || [];

  const routePattern =
    type === "bois" ? routePatterns.boi : routePatterns.matriz;

  return useCacheDynamicRoutes(ids, routePattern, type);
}
