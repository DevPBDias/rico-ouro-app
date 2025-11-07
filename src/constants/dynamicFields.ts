import { AnimalData } from "@/lib/db";
import { SelectedReportFields } from "@/types";

export const fieldMap: Record<
  keyof SelectedReportFields,
  [string, keyof AnimalData["animal"] | string]
> = {
  nomeAnimal: ["Nome", "nomeAnimal"],
  rgn: ["RGN", "rgn"],
  serieRGD: ["Série/RGD", "serieRGD"],
  sexo: ["Sexo", "sexo"],
  dataNascimento: ["Nascimento", "nasc"],
  corNascimento: ["Cor ao nascer", "corNascimento"],
  iabcgz: ["iABCz", "iabcgz"],
  deca: ["Deca", "deca"],
  p: ["P%", "p"],
  f: ["F%", "f"],
  pesosMedidos: ["Pesos", "pesosMedidos"],
  circunferenciaEscrotal: ["CE", "circunferenciaEscrotal"],
  vacinas: ["Vacinas", "vacinas"],
  nomePai: ["Pai", "paiNome"],
  maeSerieRGD: ["Mãe Série/RGD", "maeSerieRGD"],
  maeRGN: ["Mãe RGN", "maeRGN"],
  status: ["Status", "status"],
  farm: ["Fazenda", "farm"],
  ganhoDiario: ["GMD", "ganhoDiario"],
};
