import { AnimalData, Matriz } from "@/types/schemas.types";

/**
 * Tenta fazer o parse de uma data em string para Date
 * Suporta ISO (YYYY-MM-DD) e BR (DD/MM/YYYY)
 */
function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;

  // Tenta formato padrão (ISO ou aceito pelo navegador)
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;

  // Tenta formato BR (DD/MM/YYYY)
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      // DD/MM/YYYY -> new Date(YYYY, MM-1, DD)
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      
      date = new Date(year, month, day);
      if (!isNaN(date.getTime())) return date;
    }
  }

  return null;
}

/**
 * Calcula a idade em meses a partir da data de nascimento
 * @param birthDate - Data de nascimento no formato string
 * @returns Idade em meses
 */
export function calculateAgeInMonths(birthDate: string | undefined): number {
  const birth = parseDate(birthDate);
  if (!birth) return 0;

  try {
    const now = new Date();

    // Diferença em anos e meses
    let months = (now.getFullYear() - birth.getFullYear()) * 12;
    months -= birth.getMonth();
    months += now.getMonth();

    // Ajuste fino para o dia do mês
    if (now.getDate() < birth.getDate()) {
      months--;
    }

    return Math.max(0, months);
  } catch (error) {
    console.error("Erro ao calcular idade:", error);
    return 0;
  }
}

/**
 * Verifica se é fêmea de forma robusta
 */
function isFemaleAnimal(sexo: string | undefined): boolean {
  if (!sexo) return false;
  const s = sexo.trim().toUpperCase();
  return s === "F" || s === "FEMEA" || s === "FÊMEA" || s.startsWith("F");
}

/**
 * Verifica se um animal deve ser considerado matriz
 * Critério: Fêmea com mais de 24 meses
 */
export function shouldBeMatriz(animal: AnimalData): boolean {
  const isFemale = isFemaleAnimal(animal.animal?.sexo);
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
export function separateAnimalsAndMatrizes(
  animals: AnimalData[],
  forceMatriz: boolean = false
): {
  animals: AnimalData[];
  matrizes: Matriz[];
} {
  const normalAnimals: AnimalData[] = [];
  const matrizes: Matriz[] = [];

  console.log(`🔄 Iniciando separação. ForceMatriz: ${forceMatriz}`);

  animals.forEach((animal) => {
    const sexo = animal.animal?.sexo;
    const nasc = animal.animal?.nasc;
    const isFemale = isFemaleAnimal(sexo);
    const age = calculateAgeInMonths(nasc);
    
    // Lógica de decisão
    let qualifiesAsMatriz = false;

    if (forceMatriz) {
      // Se forçado, aceita qualquer fêmea
      qualifiesAsMatriz = isFemale;
    } else {
      // Se não forçado, aplica regra de idade (> 24 meses)
      qualifiesAsMatriz = isFemale && age > 24;
    }

    // Log para debug de casos problemáticos (primeiros 5 ou erros)
    if (!qualifiesAsMatriz && isFemale && forceMatriz) {
       console.warn(`⚠️ Fêmea ignorada mesmo com forceMatriz? Sexo: ${sexo}`);
    }

    if (qualifiesAsMatriz) {
      matrizes.push(convertAnimalToMatriz(animal));
    } else {
      normalAnimals.push(animal);
    }
  });

  return { animals: normalAnimals, matrizes };
}
