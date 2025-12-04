import * as XLSX from "xlsx";
import { Animal } from "@/types/animal.type";

/**
 * Converte uma data do formato DD/MM/YYYY para YYYY-MM-DD (ISO 8601)
 * @param dateStr - String de data no formato DD/MM/YYYY ou vazio
 * @returns String de data no formato YYYY-MM-DD ou undefined
 */
function convertDateToISO(dateStr: string): string | undefined {
  if (!dateStr || dateStr.trim() === "") return undefined;

  // Tenta fazer parse da data no formato DD/MM/YYYY
  const parts = dateStr.trim().split("/");

  if (parts.length === 3) {
    const [day, month, year] = parts;
    // Valida se são números válidos
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y > 1900) {
      // Formata para YYYY-MM-DD
      const paddedMonth = m.toString().padStart(2, "0");
      const paddedDay = d.toString().padStart(2, "0");
      return `${y}-${paddedMonth}-${paddedDay}`;
    }
  }

  return undefined;
}

/**
 * Limpa valores de string vazios para undefined
 * @param value - Valor a ser limpo
 * @returns String limpa ou undefined
 */
function cleanStringValue(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const str = String(value).trim();
  return str === "" ? undefined : str;
}

export async function extractDataFromExcel(file: File): Promise<Animal[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
        });

        if (rows.length < 7) {
          throw new Error(
            "Formato de arquivo inválido: cabeçalhos não encontrados."
          );
        }

        const headers = rows[6].map((h: unknown) => String(h).trim());
        const dataRows = rows.slice(7);

        const animalStart = headers.indexOf("NOME");
        const paiStart = headers.indexOf("NOME", animalStart + 1);
        const maeStart = headers.indexOf("NOME", paiStart + 1);
        const avoStart = headers.indexOf("NOME", maeStart + 1);

        if (animalStart === -1) {
          throw new Error("Coluna 'NOME' do animal não encontrada.");
        }

        const result: Animal[] = dataRows
          .map((row) => {
            const obj: Partial<Animal> = {
              name: cleanStringValue(row[animalStart]),
              serie_rgd: String(row[animalStart + 1] || ""),
              rgn: String(row[animalStart + 2] || ""),
              sex: String(row[animalStart + 3] || "") as "M" | "F",
              born_date: convertDateToISO(String(row[animalStart + 4] || "")),
              iabcgz: cleanStringValue(row[animalStart + 5]),
              deca: cleanStringValue(row[animalStart + 6]),
              p: cleanStringValue(row[animalStart + 7]),
              f: cleanStringValue(row[animalStart + 8]),
              father_name:
                paiStart !== -1 ? cleanStringValue(row[paiStart]) : undefined,
              mother_serie_rgd:
                maeStart !== -1
                  ? cleanStringValue(row[maeStart + 1])
                  : undefined,
              mother_rgn:
                maeStart !== -1
                  ? cleanStringValue(row[maeStart + 2])
                  : undefined,
              maternal_grandfather_name:
                avoStart !== -1 ? cleanStringValue(row[avoStart]) : undefined,
              status: "-" as const,
              farm_id: undefined,
            };

            return obj as Animal;
          })
          .filter((item) => item.rgn && item.rgn.trim() !== "");

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
