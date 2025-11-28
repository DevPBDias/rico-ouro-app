import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton pattern for client-side
let clientInstance: SupabaseClient | undefined;

export function getBrowserSupabase() {
  if (typeof window === "undefined") {
    // Server-side: always create a new instance to avoid sharing state between requests
    return createClient(supabaseUrl, supabaseAnonKey);
  }

  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    });
  }

  return clientInstance;
}

// Export a default instance for backward compatibility if needed,
// but prefer using getBrowserSupabase() to ensure singleton behavior.
export const supabase = getBrowserSupabase();
