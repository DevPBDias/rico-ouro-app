export const formatDate = (dateString: string | undefined) => {
  if (!dateString || typeof dateString !== "string") return "";

  try {
    // Se já estiver no formato DD/MM/YYYY, retorna como está
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }

    // Normaliza separadores
    const normalized = dateString.split("T")[0].replace(/[./]/g, "-");
    const parts = normalized.split("-");

    if (parts.length === 3) {
      let year, month, day;
      if (parts[0].length === 4) {
        [year, month, day] = parts;
      } else {
        [day, month, year] = parts;
      }

      // Adiciona segurança de meio-dia para evitar shifts de fuso horário
      const date = new Date(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T12:00:00`
      );
      return date.toLocaleDateString("pt-BR");
    }

    return dateString;
  } catch (e) {
    return dateString;
  }
};

export const getTodayFormatted = () => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
};
