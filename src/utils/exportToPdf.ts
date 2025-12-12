import { Animal } from "@/types/animal.type";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveBlobAsFile } from "./saveBlobFile";
import { SelectedReportFields } from "@/types/report_field.type";
import { fieldMap } from "@/constants/dynamicFields";

export async function generateAnimalReportPDF(
  data: Animal[],
  selectedFields: SelectedReportFields
): Promise<{
  success: boolean;
  method: "share" | "save-picker" | "download";
} | null> {
  if (!data || data.length === 0) {
    alert("Nenhum dado disponível para gerar o relatório!");
    return null;
  }

  const doc = new jsPDF({ orientation: "landscape" });

  const headerColor: [number, number, number] = [25, 98, 174];
  doc.setFillColor(...headerColor);
  doc.rect(0, 0, doc.internal.pageSize.width, 25, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("RELATÓRIO DE ANIMAIS", doc.internal.pageSize.width / 2, 11, {
    align: "center",
  });
  doc.setFontSize(10);
  doc.text(
    `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
    doc.internal.pageSize.width / 2,
    19,
    { align: "center" }
  );

  const columns = Object.entries(fieldMap)
    .filter(([key]) => selectedFields[key as keyof SelectedReportFields])
    .map(([, [header, key]]) => ({ header, key }));

  const sortedData = [...data].sort((a, b) => {
    const rgnA = parseInt(a.rgn || "0", 10);
    const rgnB = parseInt(b.rgn || "0", 10);
    return rgnB - rgnA;
  });

  type ReportRow = {
    nomeAnimal: string;
    rgn: string;
    serieRGD: string;
    sexo: string;
    nasc: string;
    corNascimento: string;
    iabcgz: string;
    deca: string;
    p: string;
    f: string;
    paiNome: string;
    maeSerieRGD: string;
    maeRGN: string;
    pesosMedidos: string;
    vacinas: string;
    circunferenciaEscrotal: string;
    status: string;
    farm: string;
    ganhoDiario: string;
  };

  const body: ReportRow[] = sortedData.map((animal) => {
    const nome =
      animal.name?.trim() ||
      `${animal.serie_rgd || ""} ${animal.rgn || ""}`.trim();

    const formatDate = (d?: string) =>
      d ? new Date(d).toLocaleDateString("pt-BR") : "-";

    return {
      nomeAnimal: nome || "-",
      rgn: animal.rgn || "-",
      serieRGD: animal.serie_rgd || "-",
      sexo: animal.sex || "-",
      nasc: formatDate(animal.born_date),
      corNascimento: animal.born_color || "-",
      iabcgz: animal.iabcgz || "-",
      deca: animal.deca || "-",
      p: animal.p || "-",
      f: animal.f || "-",
      paiNome: animal.father_name || "-",
      maeSerieRGD: animal.mother_serie_rgd || "-",
      maeRGN: animal.mother_rgn || "-",
      pesosMedidos: "-", // Dados agora vêm de animal_metrics_weight
      vacinas: "-", // Dados agora vêm de animal_vaccines
      circunferenciaEscrotal: "-", // Dados agora vêm de animal_metrics_ce
      status: animal.status || "-",
      farm: animal.farm_id?.toString() || "-",
      ganhoDiario: "-", // Pode ser calculado a partir dos pesos
    };
  });

  autoTable(doc, {
    startY: 35,
    head: [columns.map((col) => col.header)],
    body: body.map((row) =>
      columns.map((col) => row[col.key as keyof ReportRow])
    ),
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 4,
      valign: "middle",
      textColor: [30, 30, 30],
    },
    headStyles: {
      fillColor: headerColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 35, left: 10, right: 10 },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  doc.setFontSize(10);
  doc.setTextColor(50);
  doc.text(
    `Total de animais: ${data.length}`,
    14,
    doc.internal.pageSize.height - 10
  );

  const pdfBlob = doc.output("blob");
  const fileName = `relatorio_animais_${Date.now()}.pdf`;

  return await saveBlobAsFile(pdfBlob, fileName, {
    shareTitle: "📊 Relatório de Animais",
    shareText: `Relatório com ${data.length} animais - INDI Ouro`,
  });
}
