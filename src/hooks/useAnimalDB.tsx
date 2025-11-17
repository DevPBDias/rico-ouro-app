import { useEffect, useState } from "react";
import { db, AnimalData } from "../lib/db";
import type { IStatus } from "@/types/status-type";

type Vacina = {
  nome: string;
  data: string;
};

export function useAnimalDB() {
  const [dados, setDados] = useState<AnimalData[]>([]);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async (): Promise<void> => {
    const data = await db.animals.toArray();
    const sortedData = data.sort((a, b) => {
      const rgnA = a.animal.rgn || "";
      const rgnB = b.animal.rgn || "";
      return rgnB.localeCompare(rgnA, undefined, { numeric: true });
    });
    setDados(sortedData);
  };

  const buscarPorRgn = async (rgn: string): Promise<AnimalData | undefined> => {
    try {
      const animal = await db.animals.where("animal.rgn").equals(rgn).first();
      if (!animal) {
        console.warn(`⚠️ Animal não encontrado com RGN: ${rgn}`);
        return undefined;
      }
      return animal;
    } catch (error) {
      console.error("❌ Erro ao buscar animal:", error);
      throw error;
    }
  };

  const adicionarAnimal = async (novo: AnimalData): Promise<void> => {
    if (!validarAnimal(novo)) {
      return;
    }

    const existente = await buscarAnimalPorIdentificadores(novo);
    if (existente) {
      return;
    }

    await persistirNovoAnimal(novo);
  };

  const adicionarVacina = async (
    rgn: string,
    vacina: Vacina
  ): Promise<boolean> => {
    try {
      const animal = await buscarPorRgn(rgn);
      if (!animal) {
        throw new Error("Animal não encontrado");
      }

      await atualizarVacinasAnimal(animal, vacina);
      return true;
    } catch (error) {
      console.error("❌ Erro ao adicionar vacina:", error);
      throw error;
    }
  };

  const atualizarFazenda = async (
    rgn: string,
    farmName: string | null
  ): Promise<boolean> => {
    try {
      const animal = await buscarPorRgn(rgn);
      if (!animal) {
        throw new Error("Animal não encontrado");
      }

      await atualizarFazendaAnimal(animal, farmName);
      return true;
    } catch (error) {
      console.error("❌ Erro ao atualizar fazenda:", error);
      throw error;
    }
  };

  const atualizarStatus = async (
    rgn: string,
    status: IStatus | null
  ): Promise<boolean> => {
    try {
      const animal = await buscarPorRgn(rgn);
      if (!animal) {
        throw new Error("Animal não encontrado");
      }

      await atualizarStatusAnimal(animal, status);
      return true;
    } catch (error) {
      console.error("❌ Erro ao atualizar status:", error);
      throw error;
    }
  };

  const salvarOuAtualizar = async (novos: AnimalData[]): Promise<void> => {
    const operacoes = novos.map(async (item) => {
      if (!validarAnimal(item)) return;

      const existente = await buscarAnimalPorIdentificadores(item);
      if (existente) {
        await atualizarAnimalExistente(existente, item);
      } else {
        await persistirNovoAnimal(item);
      }
    });

    await Promise.all(operacoes);
    await carregar();
  };

  const limpar = async (): Promise<void> => {
    await db.animals.clear();
    setDados([]);
  };

  const excluirPorRgn = async (rgn: string): Promise<void> => {
    await db.animals.where("animal.rgn").equals(rgn).delete();
    await carregar();
  };

  const validarAnimal = (animal: AnimalData): boolean => {
    if (!animal.animal.rgn) {
      console.warn("⚠️ RGN é obrigatório");
      return false;
    }
    return true;
  };

  const buscarAnimalPorIdentificadores = async (
    animal: AnimalData
  ): Promise<AnimalData | undefined> => {
    return await db.animals
      .where("[animal.serieRGD+animal.rgn]")
      .equals([animal.animal.serieRGD || "", animal.animal.rgn || ""])
      .first();
  };

  const persistirNovoAnimal = async (animal: AnimalData): Promise<void> => {
    const uuid = crypto.randomUUID();
    const animalParaSalvar = { ...prepararDadosAnimal(animal), uuid };
    await db.animals.add(animalParaSalvar);
    await db.syncQueue.add({
      id: crypto.randomUUID(),
      table: "animals",
      operation: "create",
      payload: animalParaSalvar,
      uuid,
      createdAt: new Date().toISOString(),
    });
    await carregar();
  };

  const atualizarAnimalExistente = async (
    existente: AnimalData,
    novoDado: AnimalData
  ): Promise<void> => {
    const merged = mesclarDadosAnimal(existente, novoDado);
    const uuid = existente.uuid || crypto.randomUUID();
    if (!existente.uuid) {
      await db.animals.update(existente.id!, { uuid });
    }
    await db.animals.put({ ...merged, id: existente.id! });
    await db.syncQueue.add({
      id: crypto.randomUUID(),
      table: "animals",
      operation: "update",
      payload: merged,
      uuid,
      createdAt: new Date().toISOString(),
    });
    await carregar();

  };

  const atualizarVacinasAnimal = async (
    animal: AnimalData,
    vacina: Vacina
  ): Promise<void> => {
    const vacinaJaExiste = animal.animal.vacinas?.some(
      (v) => v.nome === vacina.nome && v.data === vacina.data
    );

    if (vacinaJaExiste) {
      console.warn("⚠️ Vacina já registrada para este animal");
      return;
    }

    const vacinasAtualizadas = [...(animal.animal.vacinas || []), vacina];

    try {
      await db.animals.update(animal.id!, {
        animal: {
          ...animal.animal,
          vacinas: vacinasAtualizadas,
          updatedAt: new Date().toISOString(),
        },
      });
      await carregar();
    } catch (error) {
      console.error("❌ Erro ao atualizar vacinas:", error);
      throw error;
    }
  };

  const atualizarFazendaAnimal = async (
    animal: AnimalData,
    farmName: string | null
  ): Promise<void> => {
    try {
      await db.animals.update(animal.id!, {
        animal: {
          ...animal.animal,
          farm: farmName || undefined,
          updatedAt: new Date().toISOString(),
        },
      });
      await carregar();
    } catch (error) {
      console.error("❌ Erro ao atualizar fazenda:", error);
      throw error;
    }
  };

  const atualizarStatusAnimal = async (
    animal: AnimalData,
    status: IStatus | null
  ): Promise<void> => {
    try {
      await db.animals.update(animal.id!, {
        animal: {
          ...animal.animal,
          status: status || undefined,
          updatedAt: new Date().toISOString(),
        },
      });
      await carregar();
    } catch (error) {
      console.error("❌ Erro ao atualizar status:", error);
      throw error;
    }
  };

  const prepararDadosAnimal = (animal: AnimalData): AnimalData => {
    return {
      ...animal,
      animal: {
        ...animal.animal,
        pesosMedidos: animal.animal.pesosMedidos ?? [],
        circunferenciaEscrotal: animal.animal.circunferenciaEscrotal ?? [],
        updatedAt: new Date().toISOString(),
      },
    };
  };

  const mesclarDadosAnimal = (
    existente: AnimalData,
    novoDado: AnimalData
  ): AnimalData => {
    return {
      ...existente,
      ...novoDado,
      animal: {
        ...existente.animal,
        ...novoDado.animal,
        pesosMedidos: existente.animal.pesosMedidos ?? [],
        circunferenciaEscrotal: existente.animal.circunferenciaEscrotal ?? [],
        updatedAt: new Date().toISOString(),
      },
    };
  };

  return {
    dados,
    salvarOuAtualizar,
    adicionarAnimal,
    limpar,
    excluirPorRgn,
    adicionarVacina,
    atualizarFazenda,
    atualizarStatus,
    buscarPorRgn,
  };
}
