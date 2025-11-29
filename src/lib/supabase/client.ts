import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Global singleton instance
let instance: SupabaseClient | null = null;

/**
 * Get or create the Supabase client singleton
 * IMPORTANT: Only call this on the client-side
 */
export function getSupabase(): SupabaseClient {
  // Server-side: create temporary instance
  if (typeof window === "undefined") {
    return createClient(supabaseUrl, supabaseAnonKey);
  }

  // Client-side: use singleton
  if (!instance) {
    const url = supabaseUrl || "https://placeholder.supabase.co";
    const key = supabaseAnonKey || "placeholder-key";

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        "❌ Supabase environment variables are missing! Check your Vercel project settings."
      );
    }

    instance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    });
  }

  return instance;
}


// For backward compatibility - but prefer getSupabase()
export const supabase = getSupabase();
