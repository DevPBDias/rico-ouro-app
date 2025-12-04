import { AnimalData, Matriz } from "@/types/schemas.types";

/**
 * Calcula a idade em meses a partir da data de nascimento
 * @param birthDate - Data de nascimento no formato string (ex: "2020-01-15")
 * @returns Idade em meses
 */
export function calculateAgeInMonths(birthDate: string | undefined): number {
  if (!birthDate) return 0;

  try {
    const birth = new Date(birthDate);
    const now = new Date();

    // Diferença em milissegundos
    const diffMs = now.getTime() - birth.getTime();

    // Converter para meses (aproximadamente 30.44 dias por mês)
    const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));

    return months;
  } catch (error) {
    console.error("Erro ao calcular idade:", error);
    return 0;
  }
}

/**
 * Verifica se um animal deve ser considerado matriz
 * Critério: Fêmea com mais de 24 meses
 */
export function shouldBeMatriz(animal: AnimalData): boolean {
  const isFemale = animal.animal?.sexo?.toUpperCase() === "F";
  const ageInMonths = calculateAgeInMonths(animal.animal?.nasc);

  return isFemale && ageInMonths > 24;
}

/**
 * Converte um AnimalData para Matriz
 */
export function convertAnimalToMatriz(animal: AnimalData): Matriz {
  return {
    uuid: animal.uuid || crypto.randomUUID(),
    nome: animal.animal?.nome,
    serieRGD: animal.animal?.serieRGD,
    rgn: animal.animal?.rgn,
    sexo: animal.animal?.sexo,
    nasc: animal.animal?.nasc,
    iabcgz: animal.animal?.iabcgz,
    deca: animal.animal?.deca,
    p: animal.animal?.p,
    f: animal.animal?.f,
    status: animal.animal?.status as any, // Cast para IStatus
    farm: animal.animal?.farm,
    vacinas: animal.animal?.vacinas,
    // Campos específicos de matriz com valores padrão
    type: undefined,
    genotipagem: undefined,
    condition: undefined,
    parturitionFrom: undefined,
    protocolosReproducao: undefined,
    _deleted: false,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Separa uma lista de animais em animais normais e matrizes
 */
export function separateAnimalsAndMatrizes(animals: AnimalData[]): {
  animals: AnimalData[];
  matrizes: Matriz[];
} {
  const normalAnimals: AnimalData[] = [];
  const matrizes: Matriz[] = [];

  animals.forEach((animal) => {
    if (shouldBeMatriz(animal)) {
      matrizes.push(convertAnimalToMatriz(animal));
    } else {
      normalAnimals.push(animal);
    }
  });

  return { animals: normalAnimals, matrizes };
}
