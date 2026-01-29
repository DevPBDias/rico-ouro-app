export type EventStage = 'D0' | 'D8' | 'D9' | 'D10' | 'D11' | 'D22' | 'D23' | 'D30' | 'D32' | 'D34' | 'D35' | 'D37' | 'D80' | 'D82' | 'D110';

export interface CalendarEvent {
  eventId: string;           // Reproduction event ID
  rgn: string;               // Animal RGN
  animalName?: string;       // Animal Name
  stage: EventStage;         // D0, D8, etc.
  date: string;              // ISO date (YYYY-MM-DD)
  protocolName: string;      // Sync D10, Sync D11, etc.
  eventType: 'IATF' | 'FIV'; // Main event type
  bullName?: string;         // Bull for this stage
  color: string;             // Identification color
}

export interface EventStageMetadata {
  label: string;
  description: string;
  color: string;
}

export const STAGE_METADATA: Record<EventStage, EventStageMetadata> = {
  'D0': { label: 'D0', description: 'Início do Protocolo', color: '#3B82F6' }, // Blue
  'D8': { label: 'D8', description: 'Manejo D8', color: '#10B981' }, // Green
  'D9': { label: 'D9', description: 'Manejo D9 (Sync D11)', color: '#10B981' },
  'D10': { label: 'D10', description: 'Inseminação D10', color: '#F59E0B' }, // Amber
  'D11': { label: 'D11', description: 'Inseminação D11 (Sync D11)', color: '#F59E0B' },
  'D22': { label: 'D22', description: 'Início Resync D22', color: '#8B5CF6' }, // Purple
  'D23': { label: 'D23', description: 'Início Resync D23 (Sync D11)', color: '#8B5CF6' },
  'D30': { label: 'D30', description: 'Diag. Gestacional D30', color: '#EF4444' }, // Red
  'D32': { label: 'D32', description: 'Diag. Gestacional / IA Resync', color: '#EF4444' },
  'D34': { label: 'D34', description: 'IA Resync (Sync D11)', color: '#EF4444' },
  'D35': { label: 'D35', description: 'Entrada Monta Natural D35', color: '#EC4899' }, // Pink
  'D37': { label: 'D37', description: 'Entrada Monta Natural D37 (Sync D11)', color: '#EC4899' },
  'D80': { label: 'D80', description: 'Saída Monta Natural D80', color: '#6366F1' }, // Indigo
  'D82': { label: 'D82', description: 'Saída Monta Natural D82 (Sync D11)', color: '#6366F1' },
  'D110': { label: 'D110', description: 'Diagnóstico Final D110', color: '#14B8A6' }, // Teal
};
