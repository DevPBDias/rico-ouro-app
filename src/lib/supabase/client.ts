"use client";

import { createBrowserClient } from "@supabase/ssr";

let supabase: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Singleton Supabase Browser Client
 *
 * ✅ Garante apenas UMA instância do GoTrueClient no browser
 * ✅ Previne o warning "Multiple GoTrueClient instances detected"
 * ✅ Usa @supabase/ssr para compatibilidade com Next.js App Router
 */
export function getBrowserSupabase() {
  if (!supabase) {
    supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabase;
}
