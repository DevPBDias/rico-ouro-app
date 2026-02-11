export interface Client {
  id: string;
  name: string;
  cpf_cnpj: string;
  inscricao_estadual?: string;
  phone?: string;
  farm?: string;
  city?: string;
  email?: string;
  created_at: number;
  updated_at: number;
  _deleted: boolean;
}
