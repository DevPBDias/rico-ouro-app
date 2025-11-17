import { db } from "@/lib/dexie";
import type { Matriz } from "@/lib/dexie";

export async function addMatriz(matriz: Matriz, providedUuid?: string) {
  const uuid = providedUuid || crypto.randomUUID();
  const record: Matriz = { ...matriz, uuid, updatedAt: new Date().toISOString() };
  const id = await db.matrices.add(record);
  await db.syncQueue.add({
    id: crypto.randomUUID(),
    table: "matrices",
    operation: "create",
    payload: record,
    uuid,
    createdAt: new Date().toISOString(),
  });
  return id;
}

export async function getMatrizById(id: number) {
  const rec = await db.matrices.get(id);
  if (!rec) return undefined;
  return { id, matriz: rec };
}

export async function getAllMatrizes() {
  const result: { id: number; matriz: Matriz }[] = [];
  await db.matrices.toCollection().each((matriz, cursor) => {
    result.push({ id: cursor.primaryKey as number, matriz });
  });
  return result;
}

export async function getMatrizesByType(type: string) {
  const all = await db.matrices.toArray();
  return all
    .filter((m) => m.type === type && typeof m.id === 'number')
    .map((m) => ({ id: m.id as number, matriz: m }));
}

export async function updateMatriz(id: number, matriz: Matriz) {
  const updated: Matriz = { ...matriz, updatedAt: new Date().toISOString() };
  await db.matrices.update(id, updated);
  const rec = await db.matrices.get(id);
  const uuid = rec?.uuid || crypto.randomUUID();
  await db.matrices.update(id, { uuid });
  await db.syncQueue.add({
    id: crypto.randomUUID(),
    table: "matrices",
    operation: "update",
    payload: updated,
    uuid,
    createdAt: new Date().toISOString(),
  });
}

export async function deleteMatriz(id: number) {
  const rec = await db.matrices.get(id);
  await db.matrices.delete(id);
  const uuid = rec?.uuid || crypto.randomUUID();
  await db.syncQueue.add({
    id: crypto.randomUUID(),
    table: "matrices",
    operation: "delete",
    payload: null,
    uuid,
    createdAt: new Date().toISOString(),
  });
}

export async function clearMatrizes() {
  await db.matrices.clear();
  const items = await db.syncQueue.where("table").equals("matrices").toArray();
  for (const item of items) {
    await db.syncQueue.delete(item.id);
  }
}
