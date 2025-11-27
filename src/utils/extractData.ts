import * as XLSX from "xlsx";
import { AnimalData } from "@/types/schemas.types";

export async function extractDataFromExcel(file: File): Promise<AnimalData[]> {
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

        const result: AnimalData[] = dataRows
          .map((row) => {
            const obj: AnimalData = {
              animal: {
                nome: String(row[animalStart] || ""),
                serieRGD: String(row[animalStart + 1] || ""),
                rgn: String(row[animalStart + 2] || ""),
                sexo: String(row[animalStart + 3] || ""),
                nasc: String(row[animalStart + 4] || ""),
                iabcgz: String(row[animalStart + 5] || ""),
                deca: String(row[animalStart + 6] || ""),
                p: String(row[animalStart + 7] || ""),
                f: String(row[animalStart + 8] || ""),
              },
              pai: {
                nome: paiStart !== -1 ? String(row[paiStart] || "") : "",
              },
              mae: {
                serieRGD:
                  maeStart !== -1 ? String(row[maeStart + 1] || "") : "",
                rgn: maeStart !== -1 ? String(row[maeStart + 2] || "") : "",
              },
              avoMaterno: {
                nome: avoStart !== -1 ? String(row[avoStart] || "") : "",
              },
            };

            return obj;
          })
          .filter((item) => item.animal.rgn && item.animal.rgn.trim() !== "");

        resolve(result);
      } catch (error) {
        console.error("Erro ao processar Excel:", error);
        reject(error);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
