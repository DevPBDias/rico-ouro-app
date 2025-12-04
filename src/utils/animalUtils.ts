export function calculateAnimalStage(
  birthDateString: string | undefined | null,
  sex: string | undefined | null
): string {
  if (!birthDateString) return "Indefinido";

  const birthDate = new Date(birthDateString);

  if (isNaN(birthDate.getTime())) return "Data Inválida";

  const today = new Date();

  let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
  months -= birthDate.getMonth();
  months += today.getMonth();

  if (today.getDate() < birthDate.getDate()) {
    months--;
  }

  months = Math.max(0, months);

  const normalizedSex = sex?.toUpperCase();

  if (months <= 12) {
    return "0 - 12 m";
  } else if (months <= 24 && months > 12) {
    return "12 - 24 m";
  } else if (months <= 36 && months > 24) {
    return "24 - 36 m";
  } else {
    return "+36 m";
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
