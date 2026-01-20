import { Animal } from "@/types/animal.type";

// Função para calcular idade em meses
function getAgeInMonths(bornDate?: string): number {
  if (!bornDate) return 0;

  const today = new Date();
  const birth = new Date(bornDate);

  const months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());

  return months;
}

// Função para verificar se um animal é matriz (fêmea com 25+ meses)
export function isMatriz(animal: Animal): boolean {
  if (animal.sex !== "F") return false;
  const ageInMonths = getAgeInMonths(animal.born_date);
  return ageInMonths >= 20;
}
