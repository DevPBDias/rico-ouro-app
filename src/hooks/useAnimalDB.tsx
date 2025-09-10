// hooks/useAnimalDB.ts
import { useEffect, useState } from "react";
import { db, AnimalData } from "../lib/db";

export function useAnimalDB() {
  const [dados, setDados] = useState<AnimalData[]>([]);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    const data = await db.animalData.toArray();
    setDados(data);
  };

  // Salva ou atualiza baseado em serieRGD+rgn
  const salvarOuAtualizar = async (novos: AnimalData[]) => {
    for (const item of novos) {
      if (!item.animal.serieRGD || !item.animal.rgn) continue;

      // Verifica se já existe
      const existente = await db.animalData
        .where("[animal.serieRGD+animal.rgn]")
        .equals([item.animal.serieRGD, item.animal.rgn])
        .first();

      if (existente) {
        // Atualiza preservando pesosMedidos e circunferenciaEscrotal
        const merged: AnimalData = {
          ...existente,
          ...item,
          animal: {
            ...existente.animal,
            ...item.animal,
            pesosMedidos: existente.animal.pesosMedidos ?? [],
            circunferenciaEscrotal: existente.animal.circunferenciaEscrotal ?? [],
            updatedAt: new Date().toISOString(),
          },
        };
        await db.animalData.put({ ...merged, id: existente.id! });
        console.log(`🔄 Atualizado: ${item.animal.serieRGD}/${item.animal.rgn}`);
      } else {
        // Insere novo garantindo arrays vazios
        const toInsert: AnimalData = {
          ...item,
          animal: {
            ...item.animal,
            pesosMedidos: item.animal.pesosMedidos ?? [],
            circunferenciaEscrotal: item.animal.circunferenciaEscrotal ?? [],
            updatedAt: new Date().toISOString(),
          },
        };
        await db.animalData.add(toInsert);
        console.log(`➕ Inserido: ${item.animal.serieRGD}/${item.animal.rgn}`);
      }
    }

    await carregar();
  };

  const limpar = async () => {
    await db.animalData.clear();
    setDados([]);
    console.log("🗑️ Todos os dados foram excluídos!");
  };

  const excluirPorRgn = async (rgn: string) => {
    await db.animalData.where("animal.rgn").equals(rgn).delete();
    console.log(`🗑️ Registro(s) removido(s) por RGN: ${rgn}`);
    await carregar();
  };

  return { dados, salvarOuAtualizar, limpar, excluirPorRgn };
}
