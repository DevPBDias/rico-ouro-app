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

      const headers = rows[6].map((h: unknown) => String(h).trim());

      const dataRows = rows.slice(7);

      const result: AnimalData[] = dataRows
        .map((row) => {
          const obj: AnimalData = {
            animal: {
              serieRGD: String(row[headers.indexOf("SERIE / RGD")] || ""),
              rgn: String(row[headers.indexOf("RGN")] || ""),
              sexo: String(row[headers.indexOf("SEXO")] || ""),
              nasc: String(row[headers.indexOf("NASC")] || ""),
              iabcgz: String(row[headers.indexOf("iABCZg")] || ""),
              deca: String(row[headers.indexOf("DECA")] || ""),
              p: String(row[headers.indexOf("P %")] || ""),
              f: String(row[headers.indexOf("F %")] || ""),
            },
            pai: {
              nome: String(
                row[headers.indexOf("NOME", headers.indexOf("F %") + 1)] || ""
              ),
            },
            mae: {
              serieRGD: String(
                row[
                  headers.indexOf(
                    "SERIE / RGD",
                    headers.indexOf("RGN", headers.indexOf("F %") + 3) + 1
                  )
                ] || ""
              ),
              rgn: String(
                row[
                  headers.indexOf(
                    "RGN",
                    headers.indexOf("RGN", headers.indexOf("F %") + 1) + 1
                  )
                ] || ""
              ),
            },
          };

          return obj;
        })
        .filter((item) => {
          return item.animal.rgn && item.animal.rgn.toString().trim() !== "";
        });

      await salvarOuAtualizarDados(result);
      resolve(result);
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
