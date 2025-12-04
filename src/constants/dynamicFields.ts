import { SelectedReportFields } from "@/types/report_field.type";
import { Animal } from "@/types/animal.type";

export const fieldMap: Record<
  keyof SelectedReportFields,
  [string, keyof Animal | string]
> = {
  name: ["Nome", "name"],
  rgn: ["RGN", "rgn"],
  serie_rgd: ["Série/RGD", "serie_rgd"],
  sex: ["Sexo", "sex"],
  born_date: ["Nascimento", "born_date"],
  born_color: ["Cor ao nascer", "born_color"],
  iabcgz: ["iABCz", "iabcgz"],
  deca: ["Deca", "deca"],
  p: ["P%", "p"],
  f: ["F%", "f"],
  animal_metrics_weight: ["Pesos", "animal_metrics_weight"],
  animal_metrics_ce: ["CE", "animal_metrics_ce"],
  vaccines: ["Vacinas", "vaccines"],
  father_name: ["Pai", "father_name"],
  mother_serie_rgd: ["Mãe Série/RGD", "mother_serie_rgd"],
  mother_rgn: ["Mãe RGN", "mother_rgn"],
  maternal_grandfather_name: ["Avô Materno", "maternal_grandfather_name"],
  status: ["Status", "status"],
  farm_name: ["Fazenda", "farm_id"],
  daily_gain: ["GMD", "daily_gain"],
};
