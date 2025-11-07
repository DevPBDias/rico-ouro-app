import * as XLSX from "xlsx";
import { salvarOuAtualizarDados } from "./helpersDB";
import { AnimalData } from "@/lib/db";

export async function extractDataFromExcel(file: File): Promise<AnimalData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // 🟩 Cabeçalhos começam na linha 6 (índice 6)
      const headers = rows[6].map((h: unknown) => String(h).trim());
      const dataRows = rows.slice(7);

      // Encontrar índices fixos de cada bloco
      const animalStart = headers.indexOf("NOME");
      const paiStart = headers.indexOf("NOME", animalStart + 1);
      const maeStart = headers.indexOf("NOME", paiStart + 1);
      const avoStart = headers.indexOf("NOME", maeStart + 1);

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
              nome: String(row[paiStart] || ""),
            },
            mae: {
              serieRGD: String(row[maeStart + 1] || ""),
              rgn: String(row[maeStart + 2] || ""),
            },
            avoMaterno: {
              nome: String(row[avoStart] || ""),
            },
          };

          return obj;
        })
        .filter((item) => item.animal.rgn && item.animal.rgn.trim() !== "");

      await salvarOuAtualizarDados(result);
      resolve(result);
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
