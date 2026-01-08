import { TableColumn } from "../types";

export const MAX_SELECTABLE_COLUMNS = 9;

export const ANIMAL_REPORT_AVAILABLE_COLUMNS: TableColumn[] = [
  { header: "NASCIMENTO", dataKey: "birthDate" },
  { header: "IDADE", dataKey: "age" },
  { header: "PAI (RGD)", dataKey: "fatherRgd" },
  { header: "MÃE (RGD)", dataKey: "motherRgd" },
  { header: "iABCGz", dataKey: "iabcgz" },
  { header: "DECA", dataKey: "deca" },
  { header: "AVÔ MATERNO", dataKey: "maternal_grandfather_name" },
  { header: "AVÔ PATERNO", dataKey: "paternal_grandfather_name" },
  { header: "P%", dataKey: "p" },
  { header: "F%", dataKey: "f" },
  { header: "CLASSE", dataKey: "classification" },
  { header: "STATUS", dataKey: "status" },
  { header: "SOCIEDADE", dataKey: "society" },
  { header: "SEXO", dataKey: "sex" },
];

export const DEFAULT_SELECTED_COLUMNS: TableColumn[] = [
  { header: "NASCIMENTO", dataKey: "birthDate" },
  { header: "CLASSE", dataKey: "classification" },
  { header: "STATUS", dataKey: "status" },
];
