import {
  syncMatrizToSupabase,
  deleteMatrizFromSupabase,
  fetchMatrizesFromSupabase,
} from "@/lib/supabase-client";
import type { Matriz } from "@/lib/db";

export async function syncMatriz(matriz: Matriz, uuid: string) {
  return syncMatrizToSupabase(matriz, uuid);
}

export async function removeMatriz(uuid: string) {
  return deleteMatrizFromSupabase(uuid);
}

export async function fetchMatrizes() {
  return fetchMatrizesFromSupabase();
}
