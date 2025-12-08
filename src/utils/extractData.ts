import * as XLSX from "xlsx";
import { Animal } from "@/types/animal.type";

function convertDateToISO(dateValue: unknown): string | undefined {
  if (dateValue === null || dateValue === undefined) return undefined;

  // Handle Excel serial number (days since 1900-01-01, with Excel bug for 1900 leap year)
  if (typeof dateValue === "number") {
    // Excel serial date to JavaScript Date
    // Excel incorrectly considers 1900 a leap year, so we need to adjust
    const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
    const jsDate = new Date(
      excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000
    );

    if (isNaN(jsDate.getTime())) return undefined;

    const y = jsDate.getFullYear();
    const m = jsDate.getMonth() + 1;
    const d = jsDate.getDate();
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  // Handle string format DD/MM/YYYY
  const dateStr = String(dateValue).trim();
  if (dateStr === "") return undefined;

  const [d, m, y] = dateStr.split("/").map((x) => parseInt(x, 10));
  if (!d || !m || !y) return undefined;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function cleanStringValue(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const s = String(value).trim();
  return s === "" ? undefined : s;
}

function findBlockStart(headers: string[], blockName: string): number {
  return headers.findIndex((h) => h.toUpperCase() === blockName.toUpperCase());
}

export async function extractDataFromExcel(file: File): Promise<Animal[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
        });

        if (rows.length < 8)
          throw new Error("Estrutura inesperada: poucas linhas.");

        const blockHeader = rows[5].map((h: any) => String(h || "").trim());

        const colHeader = rows[6].map((h: any) => String(h || "").trim());

        const animalStart = findBlockStart(blockHeader, "ANIMAL");
        const paiStart = findBlockStart(blockHeader, "PAI");
        const maeStart = findBlockStart(blockHeader, "MÃE");
        const avoStart = findBlockStart(blockHeader, "AVÔ MATERNO");

        const genotypingStart = findBlockStart(colHeader, "GENOTIPADO");
        const classificationStart = findBlockStart(colHeader, "CLASSE");

        console.log("📍 Block positions:", {
          animalStart,
          paiStart,
          maeStart,
          avoStart,
        });

        if (animalStart === -1) throw new Error("Bloco ANIMAL não encontrado.");

        const dataRows = rows.slice(7);

        const result = dataRows
          .map((row) => {
            if (!row || row.length === 0) return undefined;

            return {
              name: cleanStringValue(row[animalStart]),
              serie_rgd: cleanStringValue(row[animalStart + 1]),
              rgn: cleanStringValue(row[animalStart + 2]),
              sex: cleanStringValue(row[animalStart + 3]) as "M" | "F",
              born_date: convertDateToISO(row[animalStart + 4]),
              iabcgz: cleanStringValue(row[animalStart + 5]),
              deca: cleanStringValue(row[animalStart + 6]),
              p: cleanStringValue(row[animalStart + 7]),
              f: cleanStringValue(row[animalStart + 8]),
              genotyping:
                genotypingStart !== -1
                  ? cleanStringValue(row[genotypingStart])
                  : undefined,
              classification:
                classificationStart !== -1
                  ? cleanStringValue(row[classificationStart])
                  : undefined,
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
              status: "-",
              farm_id: undefined,
            } as Animal;
          })
          .filter((item) => item && item.rgn) as Animal[];

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
