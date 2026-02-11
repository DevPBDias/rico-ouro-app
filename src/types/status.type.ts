export interface AnimalStatus {
  id: string;
  status_name: string;
  created_at: number;
  updated_at: number;
  _deleted: boolean;
}

// Legacy type for backward compatibility
export type IStatus = string;
