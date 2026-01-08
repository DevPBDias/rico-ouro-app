import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ReproductionReportData } from "../types";
import { DEFAULT_TABLE_STYLES } from "../core/base-styles";
import {
  drawHeader,
  drawFooter,
  generateCoverPage,
} from "../core/branding-utils";

export const generateReproductionPDF = async (
  reportData: ReproductionReportData
) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const brandingOptions = {
    reportName: "RELATÓRIO DE REPRODUÇÃO (MANEJO)",
    farmName: reportData.farmName,
    gender: "Fêmeas",
    systemName: reportData.systemName,
    reportDate: reportData.reportDate,
    totalItems: reportData.data.length,
  };

  // 1. Capa
  generateCoverPage(doc, {
    ...brandingOptions,
    gender: `Manejo em: ${reportData.managementDate}`,
  });

  // 2. Colunas
  const columns = [
    { header: "RGD RGN", dataKey: "rgdn" },
    { header: "NOME DO ANIMAL", dataKey: "animalName" },
    { header: "TIPO DE MANEJO", dataKey: "managementType" },
    { header: "DATA", dataKey: "date" },
    { header: "OBSERVAÇÕES", dataKey: "observations" },
  ];

  // Ordenação RGN Decrescente
  const sortedData = [...reportData.data].sort((a, b) => {
    return b.rgn.localeCompare(a.rgn, undefined, { numeric: true });
  });

  const rows = sortedData.map((item) => ({
    rgdn: `${item.rgd || ""} ${item.rgn || ""}`.trim() || "---",
    animalName: item.animalName || "---",
    managementType: item.managementType,
    date: item.date,
    observations: item.observations || "---",
  }));

  // 3. Tabela
  autoTable(doc, {
    ...DEFAULT_TABLE_STYLES,
    columns: columns,
    body: rows,
    columnStyles: {
      rgdn: { cellWidth: 35 },
      animalName: { cellWidth: 60 },
      managementType: { cellWidth: 60 },
      date: { cellWidth: 30 },
      observations: { cellWidth: "auto" },
    },
  });

  // 4. Branding
  drawHeader(doc, brandingOptions);
  drawFooter(doc);

  // 5. Salvar
  const filename = `relatorio-reproducao-${reportData.farmName
    .toLowerCase()
    .replace(/\s+/g, "-")}.pdf`;
  doc.save(filename);
};
