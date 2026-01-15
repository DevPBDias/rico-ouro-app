import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { AnimalReportData, TableColumn } from "../types";
import { DEFAULT_TABLE_STYLES } from "../core/base-styles";
import { drawHeader, drawFooter } from "../core/branding-utils";

export const generateAnimalsByFarmPDF = async (
  reportData: AnimalReportData,
  selectableColumns: TableColumn[]
) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const genderFormat = (gender: string) => {
    switch (gender) {
      case "M":
        return "MACHOs";
      case "F":
        return "FEMEAs";
      default:
        return "animais";
    }
  };

  const brandingOptions = {
    reportName: "RELATÓRIO DE ANIMAIS POR FAZENDA",
    farmName: reportData.farmName,
    gender: genderFormat(reportData.gender),
    totalItems: reportData.totalItems,
    systemName: reportData.systemName,
    reportDate: reportData.reportDate,
  };

  // 2. Preparação de Dados e Colunas
  // Coluna fixa inicial
  const columns = [
    { header: "RGD RGN", dataKey: "rgdn" },
    // Adiciona colunas de filtro se necessário (quando filterMode é "all")
    ...(reportData.showFarmColumn
      ? [{ header: "FAZENDA", dataKey: "farmName" }]
      : []),
    ...(reportData.showSexColumn ? [{ header: "SEXO", dataKey: "sex" }] : []),
    ...(reportData.showStatusColumn
      ? [{ header: "STATUS", dataKey: "status" }]
      : []),
    ...selectableColumns,
  ];

  // Ordenação RGN Ascendente
  const sortedData = [...reportData.data].sort((a, b) => {
    const rgnA = a.rgn || "";
    const rgnB = b.rgn || "";
    return rgnA.localeCompare(rgnB, undefined, { numeric: true });
  });

  // Mapeamento dos dados para a tabela
  const rows = sortedData.map((item) => {
    const row: Record<string, string> = {
      rgdn: `${item.rgd || ""} ${item.rgn || ""}`.trim() || "---",
    };

    // Adiciona colunas de filtro se necessário
    if (reportData.showFarmColumn && item.farmName) {
      row.farmName = item.farmName;
    }
    if (reportData.showSexColumn && item.sex) {
      row.sex = item.sex;
    }
    if (reportData.showStatusColumn && item.status) {
      row.status = item.status;
    }

    // Adiciona colunas extras selecionadas
    selectableColumns.forEach((col) => {
      row[col.dataKey] = item[col.dataKey] ?? "---";
    });

    return row;
  });

  // 3. Geração da Tabela
  autoTable(doc, {
    ...DEFAULT_TABLE_STYLES,
    columns: columns,
    body: rows,
    columnStyles: {
      rgdn: { cellWidth: 23 },
      farmName: { cellWidth: 25 },
      sex: { cellWidth: 15 },
      status: { cellWidth: 20 },
      birthDate: { cellWidth: 22 },
      age: { cellWidth: 14 },
      fatherRgd: { cellWidth: 35 },
      motherRgd: { cellWidth: 22 },
      iabcgz: { cellWidth: 16 },
      deca: { cellWidth: 15 },
      maternal_grandfather_name: { cellWidth: 40 },
      paternal_grandfather_name: { cellWidth: 40 },
      p: { cellWidth: 10 },
      f: { cellWidth: 10 },
      classification: { cellWidth: 20 },
      society: { cellWidth: 30 },
      category: { cellWidth: 25 },
      observations: { cellWidth: "auto" },
    },
    didDrawPage: () => {},
  });

  // 4. Aplicação de Branding (Header/Footer em todas as páginas)
  drawHeader(doc, brandingOptions);
  drawFooter(doc);

  // 5. Salvar/Download
  const filename = `relatorio-animais-${reportData.farmName
    .toLowerCase()
    .replace(/\s+/g, "-")}.pdf`;
  doc.save(filename);
};
