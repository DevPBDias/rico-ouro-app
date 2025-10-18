import { useEffect, useState } from "react";
import { db, AnimalData } from "../lib/db";

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
    const data = await db.animalData.toArray();
    const sortedData = data.sort((a, b) => {
      const rgnA = a.animal.rgn || "";
      const rgnB = b.animal.rgn || "";
      return rgnB.localeCompare(rgnA, undefined, { numeric: true });
    });
    setDados(sortedData);
  };

  const buscarPorRgn = async (rgn: string): Promise<AnimalData | undefined> => {
    try {
      const animal = await db.animalData
        .where("animal.rgn")
        .equals(rgn)
        .first();

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
    await db.animalData.clear();
    setDados([]);
    console.log("🗑️ Todos os dados foram excluídos!");
  };

  const excluirPorRgn = async (rgn: string): Promise<void> => {
    await db.animalData.where("animal.rgn").equals(rgn).delete();
    console.log(`🗑️ Registro(s) removido(s) por RGN: ${rgn}`);
    await carregar();
  };

  // Funções auxiliares
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
    return await db.animalData
      .where("[animal.serieRGD+animal.rgn]")
      .equals([animal.animal.serieRGD || "", animal.animal.rgn || ""])
      .first();
  };

  const persistirNovoAnimal = async (animal: AnimalData): Promise<void> => {
    const animalParaSalvar = prepararDadosAnimal(animal);
    await db.animalData.add(animalParaSalvar);
    await carregar();
  };

  const atualizarAnimalExistente = async (
    existente: AnimalData,
    novoDado: AnimalData
  ): Promise<void> => {
    const merged = mesclarDadosAnimal(existente, novoDado);
    await db.animalData.put({ ...merged, id: existente.id! });
  };

  const atualizarVacinasAnimal = async (
    animal: AnimalData,
    vacina: Vacina
  ): Promise<void> => {
    // Verificar se a vacina já existe para evitar duplicação
    const vacinaJaExiste = animal.animal.vacinas?.some(
      (v) => v.nome === vacina.nome && v.data === vacina.data
    );

    if (vacinaJaExiste) {
      console.warn("⚠️ Vacina já registrada para este animal");
      return;
    }

    const vacinasAtualizadas = [...(animal.animal.vacinas || []), vacina];

    try {
      await db.animalData.update(animal.id!, {
        animal: {
          ...animal.animal,
          vacinas: vacinasAtualizadas,
          updatedAt: new Date().toISOString(),
        },
      });

      // Atualizar o estado local sem fazer nova consulta ao banco
      setDados((prevDados) =>
        prevDados.map((item) =>
          item.id === animal.id
            ? {
                ...item,
                animal: {
                  ...item.animal,
                  vacinas: vacinasAtualizadas,
                  updatedAt: new Date().toISOString(),
                },
              }
            : item
        )
      );
    } catch (error) {
      console.error("❌ Erro ao atualizar vacinas:", error);
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
    buscarPorRgn,
  };
}
