/**
 * Offline Authentication Cache
 * 
 * This module provides utilities for caching authentication state
 * to enable offline access to the app after initial login.
 */

import type { User } from "@supabase/supabase-js";

const AUTH_CACHE_KEY = 'rico_ouro_auth_cache';
const CACHE_EXPIRY_DAYS = 30; // How long to trust cached auth

interface CachedAuth {
  user: User;
  cachedAt: number;
  expiresAt: number;
}

/**
 * Save user authentication to local cache
 */
export function cacheAuth(user: User): void {
  try {
    const now = Date.now();
    const cached: CachedAuth = {
      user,
      cachedAt: now,
      expiresAt: now + (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    };
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cached));
    console.log('[AuthCache] User cached for offline access');
  } catch (error) {
    console.warn('[AuthCache] Failed to cache auth:', error);
  }
}

/**
 * Get cached authentication if valid
 */
export function getCachedAuth(): User | null {
  try {
    const stored = localStorage.getItem(AUTH_CACHE_KEY);
    if (!stored) return null;

    const cached: CachedAuth = JSON.parse(stored);
    
    // Check if expired
    if (Date.now() > cached.expiresAt) {
      console.log('[AuthCache] Cached auth expired');
      clearAuthCache();
      return null;
    }

    console.log('[AuthCache] Using cached auth (offline mode)');
    return cached.user;
  } catch (error) {
    console.warn('[AuthCache] Failed to get cached auth:', error);
    return null;
  }
}

/**
 * Clear cached authentication
 */
export function clearAuthCache(): void {
  try {
    localStorage.removeItem(AUTH_CACHE_KEY);
    console.log('[AuthCache] Cache cleared');
  } catch (error) {
    console.warn('[AuthCache] Failed to clear cache:', error);
  }
}

/**
 * Check if we have a valid cached auth
 */
export function hasCachedAuth(): boolean {
  return getCachedAuth() !== null;
}

/**
 * Get the age of the cached auth in hours
 */
export function getCacheAge(): number | null {
  try {
    const stored = localStorage.getItem(AUTH_CACHE_KEY);
    if (!stored) return null;

    const cached: CachedAuth = JSON.parse(stored);
    const ageMs = Date.now() - cached.cachedAt;
    return ageMs / (1000 * 60 * 60); // Convert to hours
  } catch {
    return null;
  }
}
