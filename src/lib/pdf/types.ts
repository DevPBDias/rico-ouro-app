export interface ReportBaseData {
  farmName: string;
  reportDate: string;
  systemName: string;
}

export type GenderFilter = "M" | "F" | "Ambos";

export interface AnimalReportData extends ReportBaseData {
  gender: GenderFilter;
  totalItems: number;
  data: any[];
}

export interface SanitaryReportData extends ReportBaseData {
  startDate: string;
  endDate: string;
  data: Array<{
    rgd?: string;
    rgn: string;
    animalName?: string;
    vaccineName: string;
    date: string;
    observations?: string;
  }>;
}

export interface WeightReportData extends ReportBaseData {
  gender: GenderFilter;
  data: Array<{
    rgd?: string;
    rgn: string;
    animalName?: string;
    p1?: { weight: number; date: string };
    p2?: { weight: number; date: string };
    p3?: { weight: number; date: string };
    p4?: { weight: number; date: string };
    p5?: { weight: number; date: string };
    gmd: number; // calculated GMD
  }>;
}

export interface ReproductionReportData extends ReportBaseData {
  managementDate: string;
  data: Array<{
    rgd?: string;
    rgn: string;
    animalName?: string;
    managementType: string;
    date: string;
    observations?: string;
    body_score?: string | number;
    cycle_stage?: string;
    ovary_size?: string;
    ovary_structure?: string;
    protocol_name?: string;
    bull_name?: string;
    resync_bull?: string;
    natural_mating_bull?: string;
    diagnostic_d30?: string;
    final_diagnostic?: string;
    [key: string]: any;
  }>;
}

export interface SemenDoseReportData extends ReportBaseData {
  totalItems: number;
  data: Array<{
    animal_name: string;
    breed: string;
    quantity: number;
    father_name?: string;
    maternal_grandfather_name?: string;
    iabcz?: string;
    registration?: string;
    center_name?: string;
  }>;
}

export interface TableColumn {
  header: string;
  dataKey: string;
}

export interface PageMetadata {
  pageNumber: number;
  totalPages: number;
}
