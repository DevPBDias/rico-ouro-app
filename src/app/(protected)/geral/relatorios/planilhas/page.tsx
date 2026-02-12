"use client";

import { useState, useMemo } from "react";
import { Download, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import Header from "@/components/layout/Header";
import { useRouter } from "next/navigation";
import { useAnimals } from "@/hooks/db/animals/useAnimals";
import { useFarms } from "@/hooks/db/farms/useFarms";
import { useStatuses } from "@/hooks/db/statuses/useStatuses";
import { useSituations } from "@/hooks/db/situations";
import { Animal } from "@/types/animal.type";
import { saveBlobAsFile } from "@/utils/saveBlobFile";

export default function ExcelExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [exportedFileName, setExportedFileName] = useState("");
  const [successMethod, setSuccessMethod] = useState<
    "share" | "save-picker" | "download"
  >("download");
  const [filterState, setFilterState] = useState<"ATIVO" | "INATIVO" | "Ambos">(
    "ATIVO",
  );
  const { animals: rawData } = useAnimals();
  const { farms } = useFarms();

  const filteredData = useMemo(() => {
    if (!rawData) return [];
    if (filterState === "Ambos") return rawData;
    return rawData.filter((a) => a.animal_state === filterState);
  }, [rawData, filterState]);

  const { statuses } = useStatuses();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { situations } = useSituations();
  const router = useRouter();

  // Create lookup maps for performance
  const farmMap = useMemo(() => {
    return farms.reduce(
      (acc, farm) => {
        acc[farm.id] = farm.farm_name;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [farms]);

  const statusMap = useMemo(() => {
    return statuses.reduce(
      (acc, status) => {
        acc[status.id] = status.status_name;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [statuses]);

  const handleExportFile = async () => {
    if (!filteredData || filteredData.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    setIsExporting(true);

    try {
      const flattenedData = filteredData.map((item: Animal) => {
        // Resolve Farm Name
        const farmName = item.farm_id
          ? farmMap[item.farm_id] || item.farm_id
          : "-";

        // Resolve Status Name
        // item.status can be an ID or an object depending on legacy data, checking both
        let statusName = "-";
        if (typeof item.status === "string") {
          statusName = statusMap[item.status] || item.status;
        } else if (
          item.status &&
          typeof item.status === "object" &&
          "status_name" in item.status
        ) {
          // @ts-ignore - handling legacy or populated structure
          statusName = item.status.status_name;
        }

        // Resolve Document Situation
        // Logic: if it contains " / ", it's likely a composed string of names.
        // If it's a UUID, we won't match it easily unless we mapped IDs.
        // Based on ManageSituation.tsx, it saves NAMES joined by " / ".
        const docSituation = item.document_situation || "-";

        return {
          RGN: item.rgn || "-",
          "Nome Animal": item.name || "-",
          Sexo: item.sex || "-",
          Nascimento: item.born_date || "-",
          "Série/RGD": item.serie_rgd || "-",
          iABCZg: item.iabcgz || "-",
          DECA: item.deca || "-",
          P: item.p || "-",
          F: item.f || "-",
          Status: statusName,
          "Situação Doc.": docSituation,
          Fazenda: farmName,
          "Cor ao Nascer": item.born_color || "-",
          Pai: item.father_name || "-",
          "Mãe Série/RGD": item.mother_rgn
            ? item.mother_serie_rgd + "-" + item.mother_rgn
            : "-",
          "Avô Materno": item.maternal_grandfather_name || "-",
          "Avô Paterno": item.paternal_grandfather_name || "-",
          Parceria: item.partnership || "-",
          Genotipagem: item.genotyping || "-",
          Condição: item.condition || "-",
          Tipo: item.type || "-",
          "Última Atualização": item.updated_at || "-",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(flattenedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Animais");

      const range = XLSX.utils.decode_range(worksheet["!ref"]!);
      worksheet["!autofilter"] = { ref: XLSX.utils.encode_range(range) };

      const colWidths = Object.keys(flattenedData[0]).map((key) => {
        const maxLength = Math.max(
          key.length,
          ...flattenedData.map(
            (row) => String(row[key as keyof typeof row] || "").length,
          ),
        );
        return { wch: maxLength + 2 };
      });
      worksheet["!cols"] = colWidths;

      const date = new Date();
      const fileName = `Exportacao_Nelore_${date.getFullYear()}${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}.xlsx`;

      // Generate blob for Web Share API
      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Static import usage
      const result = await saveBlobAsFile(blob, fileName, {
        shareTitle: "📊 Planilha de Animais",
        shareText: `Planilha com ${filteredData.length} animais - INDI Ouro`,
      });

      if (result.success) {
        setExportedFileName(fileName);
        setShowSuccessModal(true);
        setSuccessMethod(result.method);
      }
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Erro ao exportar arquivo.");
    } finally {
      setIsExporting(false);
    }
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
              Filtro de Atividade:
            </label>
            <div className="flex gap-2">
              {(["ATIVO", "INATIVO", "Ambos"] as const).map((state) => (
                <Button
                  key={state}
                  onClick={() => setFilterState(state)}
                  variant={filterState === state ? "default" : "outline"}
                  className="flex-1 h-10 text-xs font-bold"
                >
                  {state}
                </Button>
              ))}
            </div>

            <div className="rounded-lg bg-muted px-4 py-3 mt-4">
              <p className="text-sm italic text-muted-foreground">
                Os dados serão exportados em formato Excel (.xlsx) com os
                registros selecionados no filtro acima.
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
                  {filteredData?.length || 0}
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleExportFile}
            disabled={!filteredData || filteredData.length === 0 || isExporting}
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
                {successMethod === "share"
                  ? "Arquivo Compartilhado!"
                  : "Exportação Concluída"}
              </h2>
              <p className="text-muted-foreground">
                {successMethod === "share" ? (
                  <>
                    Arquivo{" "}
                    <span className="font-medium text-foreground">
                      {exportedFileName}
                    </span>{" "}
                    compartilhado com sucesso! 📤
                  </>
                ) : successMethod === "save-picker" ? (
                  <>
                    Arquivo{" "}
                    <span className="font-medium text-foreground">
                      {exportedFileName}
                    </span>{" "}
                    salvo com sucesso! 💾
                  </>
                ) : (
                  <>
                    Arquivo{" "}
                    <span className="font-medium text-foreground">
                      {exportedFileName}
                    </span>{" "}
                    baixado! ⬇️ Verifique a pasta Downloads do seu dispositivo.
                  </>
                )}
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
