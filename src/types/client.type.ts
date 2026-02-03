export interface Client {
  id: string;
  name: string;
  cpf_cnpj: string;
  inscricao_estadual?: string;
  phone?: string;
  farm?: string;
  city?: string;
  email?: string;
  updated_at?: string;
  _deleted: boolean;
}
