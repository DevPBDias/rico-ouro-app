export type AgeRange = "0 - 12 m" | "12 - 24 m" | "24 - 36 m" | "+36 m";

export const parseToDate = (dateString: string | undefined): Date | null => {
  if (!dateString || typeof dateString !== "string") return null;

  try {
    let year, month, day;

    // DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      [day, month, year] = dateString.split("/").map(Number);
    } else {
      // ISO or other formats (YYYY-MM-DD or DD-MM-YYYY)
      const normalized = dateString.split("T")[0].replace(/[./]/g, "-");
      const parts = normalized.split("-");

      if (parts.length === 3) {
        if (parts[0].length === 4) {
          [year, month, day] = parts.map(Number);
        } else {
          [day, month, year] = parts.map(Number);
        }
      } else {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        return date;
      }
    }

    if (!year || !month || !day) return null;

    // Use UTC-like safety with noon local time
    return new Date(year, month - 1, day, 12, 0, 0);
  } catch (e) {
    return null;
  }
};

export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "";

  // If already in DD/MM/YYYY, return as is
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return dateString;

  const date = parseToDate(dateString);
  if (!date) return dateString || "";

  return date.toLocaleDateString("pt-BR");
};

export const getTodayFormatted = () => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
};

export const diffInDays = (date1: string, date2: string): number => {
  const d1 = parseToDate(date1);
  const d2 = parseToDate(date2);

  if (!d1 || !d2) return 0;

  const diffEmMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffEmMs / (1000 * 60 * 60 * 24));
};

export function calculateAgeInMonths(birthDate: string | undefined): number {
  if (!birthDate) return 0;

  const birth = parseToDate(birthDate);
  if (!birth) return 0;

  const now = new Date();

  const yearsDiff = now.getFullYear() - birth.getFullYear();
  const monthsDiff = now.getMonth() - birth.getMonth();

  return yearsDiff * 12 + monthsDiff;
}

export function getAgeRange(months: number): AgeRange {
  if (months <= 12) {
    return "0 - 12 m";
  } else if (months <= 24) {
    return "12 - 24 m";
  } else if (months <= 36) {
    return "24 - 36 m";
  } else {
    return "+36 m";
  }
}
