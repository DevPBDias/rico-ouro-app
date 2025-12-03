import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let instance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (typeof window === "undefined") {
    return createClient(supabaseUrl, supabaseAnonKey);
  }

  if (!instance) {
    const url = supabaseUrl || "https://placeholder.supabase.co";
    const key = supabaseAnonKey || "placeholder-key";

    if (!supabaseUrl || !supabaseAnonKey) {
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

export const supabase = getSupabase();
