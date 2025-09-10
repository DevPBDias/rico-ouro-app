import * as XLSX from "xlsx";
import { AnimalData } from "@/lib/db";

export function exportToExcel(dados: AnimalData[], filename: string = "animais.xlsx") {
  // Prepara os dados para exportação
  const exportData = dados.map((item, index) => ({
    "ID": index + 1,
    "RGN": item.animal.rgn || "",
    "Série/RGD": item.animal.serieRGD || "",
    "Sexo": item.animal.sexo || "",
    "Nascimento": item.animal.nasc || "",
    "iABCZg": item.animal.iabcgz || "",
    "DECA": item.animal.deca || "",
    "P %": item.animal.p || "",
    "F %": item.animal.f || "",
    "Nome do Pai": item.pai?.nome || "",
    "Série/RGD da Mãe": item.mae?.serieRGD || "",
    "RGN da Mãe": item.mae?.rgn || "",
    "Pesos Medidos": item.animal.pesosMedidos?.map(p => `${p.mes}: ${p.valor}kg`).join("; ") || "",
    "Circunferência Escrotal": item.animal.circunferenciaEscrotal?.map(c => `${c.mes}: ${c.valor}cm`).join("; ") || "",
    "Última Atualização": item.animal.updatedAt || ""
  }));

  // Cria a planilha
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  
  // Ajusta a largura das colunas
  const columnWidths = [
    { wch: 5 },   // ID
    { wch: 15 },  // RGN
    { wch: 15 },  // Série/RGD
    { wch: 8 },   // Sexo
    { wch: 12 },  // Nascimento
    { wch: 10 },  // iABCZg
    { wch: 10 },  // DECA
    { wch: 8 },   // P %
    { wch: 8 },   // F %
    { wch: 20 },  // Nome do Pai
    { wch: 15 },  // Série/RGD da Mãe
    { wch: 15 },  // RGN da Mãe
    { wch: 30 },  // Pesos Medidos
    { wch: 30 },  // Circunferência Escrotal
    { wch: 20 }   // Última Atualização
  ];
  
  worksheet['!cols'] = columnWidths;

  // Cria o workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Animais");

  // Faz o download
  XLSX.writeFile(workbook, filename);
  
  console.log(`📊 Planilha exportada: ${filename} com ${dados.length} registros`);
}
