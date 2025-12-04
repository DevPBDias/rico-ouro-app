"use client";

import { useState } from "react";
import { Download, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import Header from "@/components/layout/Header";
import { useRouter } from "next/navigation";
import { useAnimals } from "@/hooks/db/animals/useAnimals";
import { Animal } from "@/types/animal.type";

export default function ExcelExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [exportedFileName, setExportedFileName] = useState("");
  const { animals: dados } = useAnimals();
  const router = useRouter();

  const handleExportFile = async () => {
    if (!dados || dados.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    setIsExporting(true);

    const flattenedData = dados.map((item: Animal) => ({
      "Nome Animal":
        item.name || `${item.serie_rgd || ""} ${item.rgn || ""}`.trim() || "-",
      RGN: item.rgn || "-",
      "Série/RGD": item.serie_rgd || "-",
      Sexo: item.sex === "M" ? "Macho" : item.sex === "F" ? "Fêmea" : "-",
      Nascimento: item.born_date || "-",
      "Cor ao Nascer": item.born_color || "-",
      iABCz: item.iabcgz || "-",
      Deca: item.deca || "-",
      "P%": item.p || "-",
      "F%": item.f || "-",
      Pai: item.father_name || "-",
      "Mãe Série/RGD": item.mother_serie_rgd || "-",
      "Mãe RGN": item.mother_rgn || "-",
      "Avô Materno": item.maternal_grandfather_name || "-",
      Status: item.status || "-",
      "Fazenda ID": item.farm_id || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Animais");

    const range = XLSX.utils.decode_range(worksheet["!ref"]!);
    worksheet["!autofilter"] = { ref: XLSX.utils.encode_range(range) };

    const colWidths = Object.keys(flattenedData[0]).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...flattenedData.map(
          (row) => String(row[key as keyof typeof row] || "").length
        )
      );
      return { wch: maxLength + 2 };
    });
    worksheet["!cols"] = colWidths;

    const date = new Date();
    const fileName = `Exportacao_Nelore_${date.getFullYear()}${String(
      date.getMonth() + 1
    ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}.xlsx`;

    XLSX.writeFile(workbook, fileName);

    setExportedFileName(fileName);
    setIsExporting(false);
    setShowSuccessModal(true);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setExportedFileName("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Relatório - planilha" />

      <main className="mx-auto max-w-md px-6 py-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="text-base font-bold uppercase text-primary">
              Exportar arquivo:
            </label>

            <div className="rounded-lg bg-muted px-4 py-3 mt-4">
              <p className="text-sm italic text-muted-foreground">
                Os dados serão exportados em formato Excel (.xlsx) com todos os
                registros.
              </p>
            </div>

            <div className="space-y-2 rounded-lg border border-border bg-background p-4">
              <div className="flex items-center gap-2 text-sm">
                <Download className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Formato:</span>
                <span className="text-muted-foreground">Excel (.xlsx)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-foreground">Registros:</span>
                <span className="text-muted-foreground">
                  {dados?.length || 0}
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleExportFile}
            disabled={!dados || dados.length === 0 || isExporting}
            className="w-full rounded-lg bg-primary py-6 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting ? "Exportando..." : "Exportar arquivo"}
          </Button>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseModal}
              className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Fechar"
            >
              <X />
            </Button>

            <div className="flex flex-col items-center space-y-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <h2 className="text-xl font-semibold text-primary">
                Exportação Concluída
              </h2>
              <p className="text-muted-foreground">
                O arquivo{" "}
                <span className="font-medium text-foreground">
                  {exportedFileName}
                </span>{" "}
                foi exportado com sucesso!
              </p>
              <div className="grid w-full grid-cols-2 gap-4 pt-4">
                <Button variant="outline" onClick={handleCloseModal}>
                  Fechar
                </Button>

                <Button onClick={() => router.push("/home")}>
                  Página inicial
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
