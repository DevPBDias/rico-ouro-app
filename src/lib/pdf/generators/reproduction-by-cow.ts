import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ReproductionByCowReportData } from "../types";
import { DEFAULT_TABLE_STYLES } from "../core/base-styles";
import { drawHeader, drawFooter } from "../core/branding-utils";

export const generateReproductionByCowPDF = async (
  reportData: ReproductionByCowReportData,
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const brandingOptions = {
    reportName: "RELATÓRIO DE REPRODUÇÃO POR VACA",
    farmName: reportData.farmName,
    gender: reportData.data.length === 1 ? "Fêmea" : "Fêmeas",
    systemName: reportData.systemName,
    reportDate: reportData.reportDate,
    totalItems: reportData.data.length,
  };

  const columns = [
    { header: "RGN", dataKey: "rgn" },
    { header: "idade", dataKey: "idade" },
    { header: "qtde", dataKey: "quantity" },
    { header: "datas d10", dataKey: "d10_dates" },
    { header: "touros", dataKey: "bull_names" },
  ];

  const sortedData = [...reportData.data].sort((a, b) =>
    a.rgn.localeCompare(b.rgn, undefined, { numeric: true }),
  );

  const rows = sortedData.map((item) => ({
    rgn: item.rgn || "---",
    idade: item.idade || "---",
    quantity: item.quantity != null ? String(item.quantity) : "0",
    d10_dates: item.d10_dates || "---",
    bull_names: item.bull_names || "---",
  }));

  autoTable(doc, {
    ...DEFAULT_TABLE_STYLES,
    columns,
    body: rows,
    columnStyles: {
      rgn: { cellWidth: 20 },
      idade: { cellWidth: 25 },
      quantity: { cellWidth: 20 },
      d10_dates: { cellWidth: 60 },
      bull_names: { cellWidth: 60 },
    },
    styles: {
      ...DEFAULT_TABLE_STYLES.styles,
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      ...DEFAULT_TABLE_STYLES.headStyles,
      fontStyle: "bold",
    },
    didParseCell: (data) => {
      if (data.section === "head") {
        data.cell.text = data.cell.text.map((text) => text.toString().toUpperCase());
      }
    },
  });

  drawHeader(doc, brandingOptions);
  drawFooter(doc);

  const filename = `relatorio-reproducao-por-vaca-${reportData.farmName
    .toLowerCase()
    .replace(/\s+/g, "-")}.pdf`;
  doc.save(filename);
};
