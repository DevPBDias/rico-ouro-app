"use client";

import { z } from "zod";

/**
 * Remove todos os caracteres não numéricos
 */
function onlyNumbers(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Valida CPF usando algoritmo oficial
 */
function isValidCPF(cpf: string): boolean {
  const numbers = onlyNumbers(cpf);
  if (numbers.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false;

  // Cálculo do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[9])) return false;

  // Cálculo do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[10])) return false;

  return true;
}

/**
 * Valida CNPJ usando algoritmo oficial
 */
function isValidCNPJ(cnpj: string): boolean {
  const numbers = onlyNumbers(cnpj);
  if (numbers.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(numbers)) return false;

  // Validação primeiro dígito
  let length = 12;
  let numbersStr = numbers.substring(0, length);
  let sum = 0;
  let pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbersStr.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(numbers.charAt(12))) return false;

  // Validação segundo dígito
  length = 13;
  numbersStr = numbers.substring(0, length);
  sum = 0;
  pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbersStr.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(numbers.charAt(13))) return false;

  return true;
}

/**
 * Valida se é um CPF ou CNPJ válido
 */
function isValidCPFOrCNPJ(value: string): boolean {
  const numbers = onlyNumbers(value);
  if (numbers.length === 11) return isValidCPF(value);
  if (numbers.length === 14) return isValidCNPJ(value);
  return false;
}

/**
 * Valida formato de telefone brasileiro
 * Aceita: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX ou apenas números
 */
function isValidPhone(phone: string): boolean {
  if (!phone || phone.trim() === "") return true; // Opcional
  const numbers = onlyNumbers(phone);
  return numbers.length >= 10 && numbers.length <= 11;
}

/**
 * Schema de validação para Cliente
 */
export const clientSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .refine(
      (val) => val.trim().split(" ").length >= 1,
      "Informe o nome completo",
    ),

  cpf_cnpj: z
    .string()
    .min(1, "CPF/CNPJ é obrigatório")
    .refine(isValidCPFOrCNPJ, "CPF ou CNPJ inválido"),

  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || isValidPhone(val),
      "Telefone inválido. Use (XX) XXXXX-XXXX",
    ),

  email: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || val.trim() === "" || z.string().email().safeParse(val).success,
      "E-mail inválido",
    ),

  city: z
    .string()
    .max(100, "Cidade deve ter no máximo 100 caracteres")
    .optional(),

  farm: z
    .string()
    .max(100, "Fazenda deve ter no máximo 100 caracteres")
    .optional(),

  inscricao_estadual: z
    .string()
    .max(20, "Inscrição Estadual deve ter no máximo 20 caracteres")
    .optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

/**
 * Função para validar dados do formulário
 * Retorna os erros formatados ou null se válido
 */
export function validateClientForm(
  data: Record<string, string>,
): Record<string, string> | null {
  const result = clientSchema.safeParse(data);

  if (result.success) {
    return null;
  }

  const errors: Record<string, string> = {};
  for (const error of result.error.issues) {
    const field = error.path[0] as string;
    if (!errors[field]) {
      errors[field] = error.message;
    }
  }

  return errors;
}

/**
 * Utilitários de formatação
 */
export const formatters = {
  /**
   * Formata CPF: 000.000.000-00
   */
  cpf(value: string): string {
    const numbers = onlyNumbers(value).slice(0, 11);
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  },

  /**
   * Formata CNPJ: 00.000.000/0000-00
   */
  cnpj(value: string): string {
    const numbers = onlyNumbers(value).slice(0, 14);
    return numbers
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  },

  /**
   * Formata CPF ou CNPJ automaticamente baseado no tamanho
   */
  cpfCnpj(value: string): string {
    const numbers = onlyNumbers(value);
    if (numbers.length <= 11) {
      return formatters.cpf(value);
    }
    return formatters.cnpj(value);
  },

  /**
   * Formata telefone: (00) 0 0000-0000 ou (00) 0000-0000
   */
  phone(value: string): string {
    const numbers = onlyNumbers(value).slice(0, 11);
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
    }
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{1})(\d{4})(\d{1,4})$/, "$1 $2-$3");
  },
};
