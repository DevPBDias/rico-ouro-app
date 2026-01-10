export type EventType = "IATF" | "FIV";

export type ReproductionStatus = "parida" | "solteira";

export type GestationalStatus = "prenha" | "vazia";

export type OvarySize = "normal" | "pequeno" | "grande";

export type OvaryStructure = "foliculo" | "corpo_luteo" | "cisto";

export type CycleStage = "estro" | "anestro 1" | "anestro 2";

export type Diagnostic = "prenha" | "vazia";

export interface ReproductionEvent {
  /** Identification */
  event_id: string; // UUID
  rgn: string;

  /** Type and Status */
  event_type: EventType;
  productive_status?: ReproductionStatus;

  /** Productive evaluation */
  evaluation_date?: string; // ISO Date (YYYY-MM-DD)
  body_score?: 1 | 2 | 3 | 4 | 5;
  gestational_condition?: GestationalStatus;

  ovary_size?: OvarySize;
  ovary_structure?: OvaryStructure;
  cycle_stage?: CycleStage;

  /** Protocol */
  protocol_name?: string;
  /** Insemination */
  d0_date: string; // insemination
  d8_date?: string;
  d10_date?: string;
  bull_name?: string;

  /** Resync / Diagnostics */
  d22_date?: string;
  d30_date?: string;
  diagnostic_d30?: Diagnostic;
  d32_date?: string;
  resync_bull?: string;

  /** Calving forecast */
  calving_start_date?: string;
  calving_end_date?: string;

  /** Natural mating */
  natural_mating_d35_entry?: string;
  natural_mating_bull?: string;
  natural_mating_d80_exit?: string;

  /** Final diagnostic */
  d110_date?: string;
  final_diagnostic?: Diagnostic;

  /** Audit */
  created_at?: string; // ISO DateTime
  updated_at?: string;
  _deleted: boolean;
}
