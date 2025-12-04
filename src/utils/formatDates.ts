export const formatDate = (dateString: string | undefined) => {
  if (!dateString || typeof dateString !== "string") return "";

  const normalized = dateString.replace(/[./]/g, "-");
  const parts = normalized.split("-").map((p) => p.trim());

  if (parts.length !== 3) return dateString;

  const [a, b, c] = parts;

  let year = "";
  let month = "";
  let day = "";

  if (a.length === 4) {
    year = a;
    month = b;
    day = c;
  } else if (c.length === 4) {
    day = a;
    month = b;
    year = c;
  } else {
    if (parseInt(b) > 12) {
      if (a.length === 4) {
        year = a;
        day = b;
        month = c;
      } else {
        day = a;
        month = c;
        year = b.length === 4 ? b : `20${b}`;
      }
    } else {
      day = a;
      month = b;
      year = c.length === 4 ? c : `20${c}`;
    }
  }

  const formattedDay = day.padStart(2, "0");
  const formattedMonth = month.padStart(2, "0");
  const formattedYear = year.padStart(4, "0").slice(-4);

  return `${formattedDay}/${formattedMonth}/${formattedYear}`;
};

export const getTodayFormatted = () => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
};
