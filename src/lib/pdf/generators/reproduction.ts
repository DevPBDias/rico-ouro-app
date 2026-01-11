import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ReproductionReportData, TableColumn } from "../types";
import { DEFAULT_TABLE_STYLES } from "../core/base-styles";
import {
  drawHeader,
  drawFooter,
  generateCoverPage,
} from "../core/branding-utils";

export const generateReproductionPDF = async (
  reportData: ReproductionReportData,
  selectableColumns: TableColumn[]
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

  // 1. Cover Page
  generateCoverPage(doc, {
    ...brandingOptions,
    gender: `Manejo em: ${reportData.managementDate}`,
  });

  // 2. Data and Column Preparation
  // RGD RGN is always the first fixed column
  const columns = [
    { header: "RGD RGN", dataKey: "rgdn" },
    ...selectableColumns,
  ];

  // Sorting: RGN Descending
  const sortedData = [...reportData.data].sort((a, b) => {
    return b.rgn.localeCompare(a.rgn, undefined, { numeric: true });
  });

  // Data Mapping
  const rows = sortedData.map((item) => {
    const row: any = {
      rgdn: `${item.rgd || ""} ${item.rgn || ""}`.trim() || "---",
    };

    // Add selected columns
    selectableColumns.forEach((col) => {
      row[col.dataKey] = item[col.dataKey] ?? "---";
    });

    return row;
  });

  // 3. Table Generation
  autoTable(doc, {
    ...DEFAULT_TABLE_STYLES,
    columns: columns,
    body: rows,
    columnStyles: {
      rgdn: { cellWidth: 23 },
      animalName: { cellWidth: 40 },
      managementType: { cellWidth: 40 },
      date: { cellWidth: 25 },
      body_score: { cellWidth: 10 },
      cycle_stage: { cellWidth: 20 },
      ovary_size: { cellWidth: 20 },
      ovary_structure: { cellWidth: 20 },
      protocol_name: { cellWidth: 30 },
      bull_name: { cellWidth: 35 },
      resync_bull: { cellWidth: 35 },
      natural_mating_bull: { cellWidth: 35 },
      diagnostic_d30: { cellWidth: 20 },
      final_diagnostic: { cellWidth: 25 },
      observations: { cellWidth: "auto" },
    },
  });

  // 4. Branding (Header/Footer on all pages)
  drawHeader(doc, brandingOptions);
  drawFooter(doc);

  // 5. Save/Download
  const filename = `relatorio-reproducao-${reportData.farmName
    .toLowerCase()
    .replace(/\s+/g, "-")}.pdf`;
  doc.save(filename);
};
