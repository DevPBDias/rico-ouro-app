export const FormatData = (dateString: string) => {
  if (!dateString.includes("-")) {
    return dateString;
  }

  const [y, m] = dateString.split("-");

  if (y && m) {
    const day = "01";
    const formattedYear = y.slice(0, 4);
    const formattedMonth = m.padStart(2, "0");

    return `${day}/${formattedMonth}/${formattedYear}`;
  }

  return dateString;
};

export const getTodayFormatted = () => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
};
