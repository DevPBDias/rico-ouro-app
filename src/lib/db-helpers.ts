import { AnimalData } from "./db";

export function normalizeAnimalData(data: Partial<AnimalData>): AnimalData {
  return {
    id: data.id ?? (0 as number),
    animal: {
      nome: data.animal?.nome,
      serieRGD: data.animal?.serieRGD,
      rgn: data.animal?.rgn,
      sexo: data.animal?.sexo,
      nasc: data.animal?.nasc,
      iabcgz: data.animal?.iabcgz,
      deca: data.animal?.deca,
      p: data.animal?.p,
      f: data.animal?.f,
      corNascimento: data.animal?.corNascimento,
      pesosMedidos: Array.isArray(data.animal?.pesosMedidos)
        ? data.animal.pesosMedidos
        : [],
      ganhoDiario: Array.isArray(data.animal?.ganhoDiario)
        ? data.animal.ganhoDiario
        : [],
      status: data.animal?.status,
      farm: data.animal?.farm,
      circunferenciaEscrotal: Array.isArray(data.animal?.circunferenciaEscrotal)
        ? data.animal.circunferenciaEscrotal
        : [],
      vacinas: Array.isArray(data.animal?.vacinas) ? data.animal.vacinas : [],
      updatedAt: data.animal?.updatedAt || new Date().toISOString(),
    },
    pai: {
      nome: data.pai?.nome,
    },
    mae: {
      serieRGD: data.mae?.serieRGD,
      rgn: data.mae?.rgn,
    },
    avoMaterno: {
      nome: data.avoMaterno?.nome,
    },
  };
}

export function serializeAnimalData(animal: AnimalData): {
  animal_json: string;
  pai_json: string;
  mae_json: string;
  avo_materno_json: string;
} {
  const normalized = normalizeAnimalData(animal);

  return {
    animal_json: JSON.stringify(normalized.animal),
    pai_json: JSON.stringify(normalized.pai),
    mae_json: JSON.stringify(normalized.mae),
    avo_materno_json: JSON.stringify(normalized.avoMaterno),
  };
}

export function deserializeAnimalData(
  id: number | undefined,
  animalJson: string,
  paiJson: string | null,
  maeJson: string | null,
  avoMaternoJson: string | null
): AnimalData {
  let animal: AnimalData["animal"];
  let pai: AnimalData["pai"];
  let mae: AnimalData["mae"];
  let avoMaterno: AnimalData["avoMaterno"];

  try {
    animal = JSON.parse(animalJson || "{}");
  } catch {
    animal = {};
  }

  try {
    pai = JSON.parse(paiJson || "{}");
  } catch {
    pai = {};
  }

  try {
    mae = JSON.parse(maeJson || "{}");
  } catch {
    mae = {};
  }

  try {
    avoMaterno = JSON.parse(avoMaternoJson || "{}");
  } catch {
    avoMaterno = {};
  }

  return normalizeAnimalData({
    id,
    animal,
    pai,
    mae,
    avoMaterno,
  });
}

export function validateAnimalData(data: unknown): data is AnimalData {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  if (!obj.animal || typeof obj.animal !== "object" || Array.isArray(obj.animal)) {
    return false;
  }

  const animal = obj.animal as Record<string, unknown>;

  if (animal.pesosMedidos && !Array.isArray(animal.pesosMedidos)) {
    return false;
  }

  if (animal.ganhoDiario && !Array.isArray(animal.ganhoDiario)) {
    return false;
  }

  if (
    animal.circunferenciaEscrotal &&
    !Array.isArray(animal.circunferenciaEscrotal)
  ) {
    return false;
  }

  if (animal.vacinas && !Array.isArray(animal.vacinas)) {
    return false;
  }

  return true;
}
