/**
 * Calculates the animal's life stage based on birth date and sex.
 *
 * Rules:
 * - 0 to 12 months: "Bezerro"
 * - 13 to 24 months: "Garrote" (Male) / "Novilha" (Female)
 * - 25+ months: "Touro" (Male) / "Matriz" (Female)
 *
 * @param birthDateString - The animal's birth date (YYYY-MM-DD or ISO string)
 * @param sex - The animal's sex ("M" or "F")
 * @returns The classification string or "Indefinido" if data is missing
 */
export function calculateAnimalStage(
  birthDateString: string | undefined | null,
  sex: string | undefined | null
): string {
  if (!birthDateString) return "Indefinido";

  const birthDate = new Date(birthDateString);

  if (isNaN(birthDate.getTime())) return "Data Inválida";

  const today = new Date();

  // Calculate difference in months
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
  months -= birthDate.getMonth();
  months += today.getMonth();

  // Adjust if the day of the month hasn't occurred yet in the current month
  if (today.getDate() < birthDate.getDate()) {
    months--;
  }

  // Ensure non-negative
  months = Math.max(0, months);

  const normalizedSex = sex?.toUpperCase();

  if (months <= 12) {
    return "Bezerro";
  } else if (months <= 24) {
    return normalizedSex === "M" ? "Garrote" : "Novilha";
  } else {
    return normalizedSex === "M" ? "Touro" : "Matriz";
  }
}

/**
 * Calculates the age in months.
 */
export function calculateAgeInMonths(
  birthDateString: string | undefined | null
): number {
  if (!birthDateString) return 0;
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) return 0;

  const today = new Date();
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
  months -= birthDate.getMonth();
  months += today.getMonth();

  if (today.getDate() < birthDate.getDate()) {
    months--;
  }

  return Math.max(0, months);
}
