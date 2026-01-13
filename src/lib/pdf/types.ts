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
    rgn: string;
    idade?: string;
    classification?: string;
    bull_name?: string;
    d0_date?: string;
    d8_date?: string;
    d10_date?: string;
    resync_bull?: string;
    resync_d0?: string;
    resync_d8?: string;
    diagnostic_d30?: string;
    resync_d10?: string;
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
