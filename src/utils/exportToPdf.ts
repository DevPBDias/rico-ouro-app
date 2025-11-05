import { AnimalData } from "@/lib/db";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface SelectedReportFields {
  nomeAnimal: boolean;
  rgn: boolean;
  serieRGD: boolean;
  sexo: boolean;
  dataNascimento: boolean;
  corNascimento: boolean;
  iabcgz: boolean;
  deca: boolean;
  p: boolean;
  f: boolean;
  pesosMedidos: boolean;
  circunferenciaEscrotal: boolean;
  vacinas: boolean;
  nomePai: boolean;
  maeSerieRGD: boolean;
  maeRGN: boolean;
  status: boolean;
  farm: boolean;
  ganhoDiario: boolean;
}

export function generateAnimalReportPDF(
  data: AnimalData[],
  selectedFields: SelectedReportFields
): void {
  if (!data || data.length === 0) {
    alert("Nenhum dado disponível para gerar o relatório!");
    return;
  }

  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFillColor(25, 98, 174);
  doc.rect(0, 0, doc.internal.pageSize.width, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("RELATÓRIO DE ANIMAIS", doc.internal.pageSize.width / 2, 12, {
    align: "center",
  });
  doc.setFontSize(10);
  doc.text(
    `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
    doc.internal.pageSize.width / 2,
    22,
    { align: "center" }
  );

  const columns: { header: string; key: string }[] = [];

  if (selectedFields.nomeAnimal)
    columns.push({ header: "Nome", key: "nomeAnimal" });
  if (selectedFields.rgn) columns.push({ header: "RGN", key: "rgn" });
  if (selectedFields.serieRGD)
    columns.push({ header: "Série/RGD", key: "serieRGD" });
  if (selectedFields.sexo) columns.push({ header: "Sexo", key: "sexo" });
  if (selectedFields.dataNascimento)
    columns.push({ header: "Nascimento", key: "nasc" });
  if (selectedFields.corNascimento)
    columns.push({ header: "Cor ao nascer", key: "corNascimento" });
  if (selectedFields.iabcgz) columns.push({ header: "iABCz", key: "iabcgz" });
  if (selectedFields.deca) columns.push({ header: "Deca", key: "deca" });
  if (selectedFields.p) columns.push({ header: "P%", key: "p" });
  if (selectedFields.f) columns.push({ header: "F%", key: "f" });
  if (selectedFields.nomePai) columns.push({ header: "Pai", key: "paiNome" });
  if (selectedFields.maeSerieRGD)
    columns.push({ header: "Mãe Série/RGD", key: "maeSerieRGD" });
  if (selectedFields.maeRGN) columns.push({ header: "Mãe RGN", key: "maeRGN" });
  if (selectedFields.pesosMedidos)
    columns.push({ header: "Pesos", key: "pesosMedidos" });
  if (selectedFields.vacinas)
    columns.push({ header: "Vacinas", key: "vacinas" });
  if (selectedFields.circunferenciaEscrotal)
    columns.push({
      header: "CE",
      key: "circunferenciaEscrotal",
    });
  if (selectedFields.farm)
    columns.push({
      header: "Fazenda",
      key: "farm",
    });
  if (selectedFields.status)
    columns.push({
      header: "Status",
      key: "status",
    });
  if (selectedFields.ganhoDiario)
    columns.push({
      header: "GMD",
      key: "ganhoDiario",
    });

  const sortedData = [...data].sort((a, b) => {
    const rgnA = parseInt(a.animal?.rgn || "0", 10);
    const rgnB = parseInt(b.animal?.rgn || "0", 10);
    return rgnB - rgnA;
  });

  const body = sortedData.map((animal) => {
    const nome =
      animal.animal.nome?.trim() ||
      `${animal.animal.serieRGD || ""} ${animal.animal.rgn || ""}`.trim();

    return {
      nomeAnimal: nome || "-",
      rgn: animal.animal.rgn || "-",
      serieRGD: animal.animal.serieRGD || "-",
      sexo: animal.animal.sexo || "-",
      nasc: animal.animal.nasc || "-",
      corNascimento: animal.animal.corNascimento || "-",
      iabcgz: animal.animal.iabcgz || "-",
      deca: animal.animal.deca || "-",
      p: animal.animal.p || "-",
      f: animal.animal.f || "-",
      paiNome: animal.pai?.nome || "-",
      maeSerieRGD: animal.mae?.serieRGD || "-",
      maeRGN: animal.mae?.rgn || "-",
      pesosMedidos:
        animal.animal.pesosMedidos
          ?.map((p) => `${p.valor}kg (${p.mes})`)
          .join(", ") || "-",
      vacinas:
        animal.animal.vacinas?.map((v) => `${v.nome} (${v.data})`).join(", ") ||
        "-",
      circunferenciaEscrotal:
        animal.animal.circunferenciaEscrotal
          ?.map((c) => `${c.valor}cm (${c.mes})`)
          .join(", ") || "-",
      status: animal.animal?.status || "-",
      farm: animal.animal?.farm || "-",
      ganhoDiario:
        animal.animal?.ganhoDiario
          ?.map((v) => `${v.dailyGain} (${v.days})`)
          .join("; ") || "-",
    };
  });

  autoTable(doc, {
    startY: 40,
    head: [columns.map((col) => col.header)],
    body: body.map((row) =>
      columns.map(
        (col) =>
          // @ts-expect-error lint error
          row[col.key]
      )
    ),
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 4,
      valign: "middle",
      textColor: [30, 30, 30],
    },
    headStyles: {
      fillColor: [25, 98, 174],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      lineColor: [220, 220, 220],
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 40, left: 10, right: 10 },
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

  const fileName = `relatorio_animais_${Date.now()}.pdf`;
  doc.save(fileName);
}
