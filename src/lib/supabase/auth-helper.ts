import { getSupabase } from "./client";

export async function getAuthToken(): Promise<string> {
  try {
    const supabase = getSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      return session.access_token;
    }
  } catch (error) {
    console.warn("⚠️ Failed to get auth session:", error);
  }

  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  const headers: Record<string, string> = {
    apikey: anonKey,
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  return headers;
}

export function cleanSupabaseDocument<T extends Record<string, any>>(
  doc: T
): T {
  const cleaned: any = {};

  for (const [key, value] of Object.entries(doc)) {
    if (value === null) {
      continue;
    }
    cleaned[key] = value;
  }

  return cleaned as T;
}

export function cleanSupabaseDocuments<T extends Record<string, any>>(
  docs: T[]
): T[] {
  return docs.map((doc) => cleanSupabaseDocument(doc));
}
