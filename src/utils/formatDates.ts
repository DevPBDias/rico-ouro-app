export const FormatData = (dateString: string | undefined) => {
  if (!dateString || typeof dateString !== "string") return "";

  const normalized = dateString.replace(/[./]/g, "-");
  const parts = normalized.split("-").map((p) => p.trim());

  let year = "";
  let month = "";
  let day = "";

  if (parts.length === 3) {
    const [a, b, c] = parts;

    if (parseInt(b) > 12) {
      year = a;
      day = b;
      month = c;
    } else {
      year = a;
      month = b;
      day = c;
    }
  } else if (parts.length === 2) {
    year = parts[0];
    month = parts[1];
    day = "01";
  } else {
    return dateString;
  }

  const formattedDay = day.padStart(2, "0");
  const formattedMonth = month.padStart(2, "0");
  const formattedYear = year.slice(0, 4);

  return `${formattedDay}/${formattedMonth}/${formattedYear}`;
};

export const getTodayFormatted = () => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
};
