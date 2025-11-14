import {
  addMatriz as dbAddMatriz,
  getMatrizById as dbGetMatrizById,
  getAllMatrizes as dbGetAllMatrizes,
  getMatrizesByType as dbGetMatrizesByType,
  updateMatriz as dbUpdateMatriz,
  deleteMatriz as dbDeleteMatriz,
} from "@/lib/sqlite-db";
import type { Matriz } from "@/lib/db";

export async function addMatriz(matriz: Matriz, providedUuid?: string) {
  return dbAddMatriz(matriz, providedUuid);
}

export async function getMatrizById(id: number) {
  return dbGetMatrizById(id);
}

export async function getAllMatrizes() {
  return dbGetAllMatrizes();
}

export async function getMatrizesByType(type: string) {
  return dbGetMatrizesByType(type);
}

export async function updateMatriz(id: number, matriz: Matriz) {
  return dbUpdateMatriz(id, matriz);
}

export async function deleteMatriz(id: number) {
  return dbDeleteMatriz(id);
}
