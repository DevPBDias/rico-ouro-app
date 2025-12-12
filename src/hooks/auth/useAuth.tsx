import { useEffect, useState, useCallback } from "react";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import {
  cacheAuth,
  getCachedAuth,
  clearAuthCache,
} from "@/lib/auth/offlineAuthCache";

const supabase = getSupabase();

/**
 * Enhanced authentication hook with offline support.
 *
 * When online: Uses Supabase auth and caches the session for offline use.
 * When offline: Uses cached session to allow access to the app.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineAuth, setIsOfflineAuth] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Check if we're online
        const isOnline =
          typeof navigator !== "undefined" ? navigator.onLine : true;

        if (isOnline) {
          // Online: Try to get session from Supabase
          const { data, error } = await supabase.auth.getSession();

          if (!mounted) return;

          if (error) {
            console.warn(
              "[Auth] Supabase error, falling back to cache:",
              error.message
            );
            // Fall back to cached auth on error
            const cachedUser = getCachedAuth();
            if (cachedUser) {
              setUser(cachedUser);
              setIsOfflineAuth(true);
            }
          } else if (data.session?.user) {
            // Valid session - cache it for offline use
            setUser(data.session.user);
            cacheAuth(data.session.user);
            setIsOfflineAuth(false);
          } else {
            // No session
            setUser(null);
          }
        } else {
          // Offline: Use cached auth
          console.log("[Auth] Offline mode - checking cached auth");
          const cachedUser = getCachedAuth();
          if (cachedUser) {
            setUser(cachedUser);
            setIsOfflineAuth(true);
            console.log("[Auth] Using cached user:", cachedUser.email);
          } else {
            console.log("[Auth] No cached auth available");
            setUser(null);
          }
        }
      } catch (error) {
        console.error("[Auth] Initialization error:", error);
        // On any error, try cached auth
        const cachedUser = getCachedAuth();
        if (cachedUser && mounted) {
          setUser(cachedUser);
          setIsOfflineAuth(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes (only works when online)
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          cacheAuth(session.user);
          setIsOfflineAuth(false);
        } else {
          // Only clear user if we're online (to preserve offline access)
          if (navigator.onLine) {
            setUser(null);
            clearAuthCache();
          }
        }
        setLoading(false);
      }
    );

    // Listen for online/offline events
    const handleOnline = async () => {
      console.log("[Auth] Back online - refreshing session");
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          setUser(data.session.user);
          cacheAuth(data.session.user);
          setIsOfflineAuth(false);
        }
      } catch (error) {
        console.warn("[Auth] Failed to refresh session:", error);
      }
    };

    const handleOffline = () => {
      console.log("[Auth] Gone offline - preserving current auth state");
      if (user) {
        setIsOfflineAuth(true);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // Check if online
    if (!navigator.onLine) {
      throw new Error(
        "Você precisa estar online para fazer login. Conecte-se à internet e tente novamente."
      );
    }

    setLoading(true);
    try {
      const res = await supabase.auth.signInWithPassword({ email, password });
      if (res.error) throw res.error;

      // Cache the auth for offline use
      if (res.data.user) {
        cacheAuth(res.data.user);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    // Clear cached auth first
    clearAuthCache();

    // Try to sign out from Supabase (may fail if offline)
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("[Auth] Supabase signOut failed (may be offline):", error);
    }

    setUser(null);
    setIsOfflineAuth(false);
  }, []);

  return {
    user,
    loading,
    signIn,
    signOut,
    /** True if using cached auth (offline mode) */
    isOfflineAuth,
  };
}
