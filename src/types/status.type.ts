export interface AnimalStatus {
  id: string;
  status_name: string;
  updated_at?: string;
  _deleted?: boolean;
}

// Legacy type for backward compatibility
export type IStatus = string;
