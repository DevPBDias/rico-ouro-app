import type { Matriz } from "@/lib/db";
import * as local from "./local";
import * as remote from "./supabase";
import {
  getSyncQueue,
  removeFromSyncQueue,
  markAsSynced,
  initSQLite,
} from "@/lib/sqlite-db";

export { local, remote };

export async function pushLocalMatrizes(): Promise<void> {
  const queue = await getSyncQueue();
  const matrizesQueue = queue.filter((q) => q.table_name === "matrizes");

  for (const item of matrizesQueue) {
    try {
      if (item.operation === "INSERT" || item.operation === "UPDATE") {
        if (!item.data_json) {
          await removeFromSyncQueue(item.id);
          continue;
        }
        const matriz: Matriz = JSON.parse(item.data_json);
        const uuid = item.uuid || "";
        await remote.syncMatriz(matriz, uuid);
        await markAsSynced("matrizes", item.record_id, uuid || "");
        await removeFromSyncQueue(item.id);
      } else if (item.operation === "DELETE") {
        if (item.uuid) {
          await remote.removeMatriz(item.uuid);
        }
        await removeFromSyncQueue(item.id);
      }
    } catch (err) {
      console.error("Erro ao sincronizar item de matrizes:", err);
    }
  }
}

export async function pullMatrizesFromRemote(): Promise<void> {
  const fetched = await remote.fetchMatrizes();
  const { initSQLite: _initSQLite } = await import("@/lib/sqlite-db");
  const database = await initSQLite();

  for (const item of fetched) {
    try {
      const uuid = item.uuid;
      const existing = await (
        await import("@/lib/sqlite-db")
      ).getMatrizByUuid(uuid);
      if (!existing) {
        await (
          await import("@/lib/sqlite-db")
        ).addMatriz(item.matriz_json, uuid);
      } else {
        database.run(
          `UPDATE matrizes SET matriz_json = ?, updated_at = datetime('now'), is_synced = 1 WHERE id = ?`,
          [JSON.stringify(item.matriz_json), existing.id]
        );
        database.run(
          `DELETE FROM sync_queue WHERE table_name = 'matrizes' AND record_id = ?`,
          [existing.id]
        );
      }
    } catch (err) {
      console.error("Erro ao aplicar matriz do remoto:", err);
    }
  }
}
