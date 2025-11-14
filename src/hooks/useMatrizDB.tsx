import { useEffect, useState } from "react";
import type { Matriz } from "@/lib/db";
import * as matrizLocal from "@/utils/matriz/local";
import { getAllMatrizes as dbGetAllMatrizes } from "@/lib/sqlite-db";
import { clearMatrizes as dbClearMatrizes } from "@/lib/sqlite-db";

export type MatrizItem = { id: number; matriz: Matriz };

export function useMatrizDB() {
  const [dados, setDados] = useState<MatrizItem[]>([]);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async (): Promise<void> => {
    const all = await matrizLocal.getAllMatrizes();
    const sorted = all.sort((a, b) => {
      const rgnA = a.matriz.rgn || "";
      const rgnB = b.matriz.rgn || "";
      return rgnB.localeCompare(rgnA, undefined, { numeric: true });
    });
    setDados(sorted);
  };

  const buscarPorRgn = async (rgn: string): Promise<MatrizItem | undefined> => {
    const found = dados.find((d) => d.matriz.rgn === rgn);
    if (found) return found;

    const all = await dbGetAllMatrizes();
    return all.find((d) => d.matriz.rgn === rgn);
  };

  const buscarPorId = async (id: number): Promise<MatrizItem | undefined> => {
    const item = await matrizLocal.getMatrizById(id);
    return item || undefined;
  };

  const validarMatriz = (m: Matriz): boolean => {
    if (!m.rgn) {
      console.warn("⚠️ RGN é obrigatório para matriz");
      return false;
    }
    return true;
  };

  const buscarMatrizPorIdentificadores = async (
    matriz: Matriz
  ): Promise<MatrizItem | undefined> => {
    const all = await matrizLocal.getAllMatrizes();
    return all.find(
      (item) =>
        (item.matriz.serieRGD || "") === (matriz.serieRGD || "") &&
        (item.matriz.rgn || "") === (matriz.rgn || "")
    );
  };

  const persistirNovo = async (matriz: Matriz): Promise<void> => {
    const id = await matrizLocal.addMatriz(matriz);
    setDados((prev) => [{ id, matriz }, ...prev]);
  };

  const adicionarMatriz = async (nova: Matriz): Promise<void> => {
    if (!validarMatriz(nova)) return;
    const existente = await buscarMatrizPorIdentificadores(nova);
    if (existente) {
      console.warn("⚠️ Matriz já existe");
      return;
    }
    await persistirNovo(nova);
  };

  const atualizarMatriz = async (id: number, matriz: Matriz): Promise<void> => {
    await matrizLocal.updateMatriz(id, matriz);
    setDados((prev) => prev.map((p) => (p.id === id ? { id, matriz } : p)));
  };

  const excluirPorRgn = async (rgn: string): Promise<void> => {
    const all = await matrizLocal.getAllMatrizes();
    const found = all.find((d) => d.matriz.rgn === rgn);
    if (!found) return;
    await matrizLocal.deleteMatriz(found.id);
    setDados((prev) => prev.filter((p) => p.id !== found.id));
  };

  const limpar = async (): Promise<void> => {
    await dbClearMatrizes();
    setDados([]);
  };

  const salvarOuAtualizar = async (novos: Matriz[]): Promise<void> => {
    const ops = novos.map(async (m) => {
      if (!validarMatriz(m)) return;
      const existente = await buscarMatrizPorIdentificadores(m);
      if (existente) {
        await atualizarMatriz(existente.id, m);
      } else {
        await persistirNovo(m);
      }
    });
    await Promise.all(ops);
    await carregar();
  };

  const getByType = async (type: string) => {
    return matrizLocal.getMatrizesByType(type);
  };

  return {
    dados,
    carregar,
    salvarOuAtualizar,
    adicionarMatriz,
    limpar,
    excluirPorRgn,
    buscarPorRgn,
    buscarPorId,
    atualizarMatriz,
    getByType,
  };
}

export default useMatrizDB;
