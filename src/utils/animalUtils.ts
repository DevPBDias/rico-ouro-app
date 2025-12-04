/**
 * Calcula a idade de um animal em meses
 */
export function calculateAgeInMonths(bornDate?: string): number {
  if (!bornDate) return 0;

  const today = new Date();
  const birth = new Date(bornDate);

  if (isNaN(birth.getTime())) return 0;

  const months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());

  return Math.max(0, months);
}

/**
 * Determina a categoria do animal baseado na idade e sexo
 */
export function calculateAnimalStage(
  bornDate?: string,
  sex?: "M" | "F"
): string {
  const ageInMonths = calculateAgeInMonths(bornDate);

  if (!sex) return "-";

  if (sex === "M") {
    if (ageInMonths < 12) return "Bezerro";
    if (ageInMonths < 24) return "Garrote";
    if (ageInMonths < 36) return "Novilho";
    return "Touro";
  } else {
    if (ageInMonths < 12) return "Bezerra";
    if (ageInMonths < 24) return "Novilha";
    if (ageInMonths < 25) return "Novilha (pré-matriz)";
    return "Matriz";
  }
}

/**
 * Verifica se um animal é matriz (fêmea com 25+ meses)
 */
export function isMatriz(bornDate?: string, sex?: "M" | "F"): boolean {
  if (sex !== "F") return false;
  const ageInMonths = calculateAgeInMonths(bornDate);
  return ageInMonths >= 25;
}
