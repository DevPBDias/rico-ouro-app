"use client";

import { useEffect, useCallback, useRef } from "react";

const CACHE_COOLDOWN_HOURS = 6;
const STORAGE_PREFIX = "route_cache_";

function hashIds(ids: string[]): string {
  const sorted = [...ids].sort();
  return `${sorted.length}_${sorted.slice(0, 10).join("_")}_${sorted
    .slice(-5)
    .join("_")}`;
}

function shouldCache(cacheKey: string, currentHash: string): boolean {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${cacheKey}`);
    if (!stored) return true;

    const { hash, timestamp } = JSON.parse(stored);

    if (hash !== currentHash) {
      console.log(`[CacheRoutes] IDs changed, will re-cache`);
      return true;
    }

    const hoursSinceLastCache = (Date.now() - timestamp) / (1000 * 60 * 60);
    if (hoursSinceLastCache >= CACHE_COOLDOWN_HOURS) {
      console.log(
        `[CacheRoutes] Cooldown passed (${hoursSinceLastCache.toFixed(
          1
        )}h), will refresh cache`
      );
      return true;
    }

    console.log(
      `[CacheRoutes] Cache is fresh (${hoursSinceLastCache.toFixed(
        1
      )}h ago), skipping`
    );
    return false;
  } catch {
    return true;
  }
}

function markCacheComplete(cacheKey: string, hash: string): void {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${cacheKey}`,
      JSON.stringify({ hash, timestamp: Date.now() })
    );
  } catch {}
}

export function useCacheDynamicRoutes(
  ids: string[],
  routePattern: (id: string) => string[],
  cacheKey: string,
  enabled: boolean = true
) {
  const hasRun = useRef(false);

  const cacheRoutes = useCallback(async () => {
    if (!enabled || ids.length === 0) return;
    if (!("serviceWorker" in navigator)) return;
    if (typeof window === "undefined") return;

    const currentHash = hashIds(ids);

    if (!shouldCache(cacheKey, currentHash)) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    if (!registration.active) return;

    const urls = ids.flatMap(routePattern);

    console.log(
      `[CacheRoutes] Starting background cache of ${urls.length} routes for "${cacheKey}"`
    );

    registration.active.postMessage({
      type: "CACHE_DYNAMIC_ROUTES",
      urls,
      cacheKey,
    });

    markCacheComplete(cacheKey, currentHash);
  }, [ids, routePattern, cacheKey, enabled]);

  useEffect(() => {
    if (hasRun.current) return;
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !navigator.onLine) return;
    if (ids.length === 0) return;

    hasRun.current = true;

    const timeoutId = setTimeout(cacheRoutes, 3000);

    return () => clearTimeout(timeoutId);
  }, [cacheRoutes, ids.length]);

  const forceCacheRoutes = useCallback(async () => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${cacheKey}`);
    } catch {}
    return cacheRoutes();
  }, [cacheRoutes, cacheKey]);

  return { cacheRoutes, forceCacheRoutes };
}

export const routePatterns = {
  boi: (id: string) => [`/bois/${id}`, `/bois/${id}/detalhes`],
  matriz: (id: string) => [`/matrizes/${id}`, `/matrizes/${id}/detalhes`],
};
