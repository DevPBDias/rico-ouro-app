"use client";

import { useEffect, useCallback, useRef } from "react";

// Configuration
const CACHE_COOLDOWN_HOURS = 6; // Don't re-cache within this period
const STORAGE_PREFIX = "route_cache_";

/**
 * Simple hash function to detect changes in ID list
 */
function hashIds(ids: string[]): string {
  const sorted = [...ids].sort();
  return `${sorted.length}_${sorted.slice(0, 10).join("_")}_${sorted
    .slice(-5)
    .join("_")}`;
}

/**
 * Check if we need to cache based on:
 * 1. Never cached before
 * 2. IDs have changed (new animals added)
 * 3. Cooldown period has passed
 */
function shouldCache(cacheKey: string, currentHash: string): boolean {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${cacheKey}`);
    if (!stored) return true;

    const { hash, timestamp } = JSON.parse(stored);

    // Check if IDs changed
    if (hash !== currentHash) {
      console.log(`[CacheRoutes] IDs changed, will re-cache`);
      return true;
    }

    // Check if cooldown passed
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

/**
 * Mark cache as complete
 */
function markCacheComplete(cacheKey: string, hash: string): void {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${cacheKey}`,
      JSON.stringify({ hash, timestamp: Date.now() })
    );
  } catch {
    // localStorage might be full or disabled
  }
}

/**
 * Hook to proactively cache dynamic routes for offline access.
 * Uses smart caching to avoid re-caching already cached routes.
 *
 * @param ids - Array of IDs to generate routes for
 * @param routePattern - Function that takes an ID and returns the route(s) to cache
 * @param cacheKey - Unique key to identify this cache set (e.g., 'bois', 'matrizes')
 * @param enabled - Whether caching is enabled (default: true)
 */
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

    // Check if we actually need to cache
    if (!shouldCache(cacheKey, currentHash)) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    if (!registration.active) return;

    // Generate all URLs to cache
    const urls = ids.flatMap(routePattern);

    console.log(
      `[CacheRoutes] Starting background cache of ${urls.length} routes for "${cacheKey}"`
    );

    // Send message to Service Worker
    registration.active.postMessage({
      type: "CACHE_DYNAMIC_ROUTES",
      urls,
      cacheKey,
    });

    // Mark as complete (SW will cache in background)
    markCacheComplete(cacheKey, currentHash);
  }, [ids, routePattern, cacheKey, enabled]);

  useEffect(() => {
    // Only run once per mount, in production, when online
    if (hasRun.current) return;
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !navigator.onLine) return;
    if (ids.length === 0) return;

    hasRun.current = true;

    // Delay to not block initial page load
    const timeoutId = setTimeout(cacheRoutes, 3000);

    return () => clearTimeout(timeoutId);
  }, [cacheRoutes, ids.length]);

  // Also provide a manual trigger (forces re-cache)
  const forceCacheRoutes = useCallback(async () => {
    // Clear the stored state to force re-cache
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${cacheKey}`);
    } catch {
      // Ignore errors
    }
    return cacheRoutes();
  }, [cacheRoutes, cacheKey]);

  return { cacheRoutes, forceCacheRoutes };
}

/**
 * Route pattern generators for common entities
 */
export const routePatterns = {
  boi: (id: string) => [`/bois/${id}`, `/bois/${id}/detalhes`],
  matriz: (id: string) => [`/matrizes/${id}`, `/matrizes/${id}/detalhes`],
};
