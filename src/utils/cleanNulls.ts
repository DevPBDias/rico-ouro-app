/**
 * Remove recursivamente propriedades com valor null ou undefined de um objeto.
 * Isso é útil para limpar dados vindos do Supabase antes de salvar no RxDB,
 * pois o RxDB/JSONSchema pode rejeitar null para campos tipados como string/number.
 */
export function cleanNulls(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined;
  }

  if (Array.isArray(obj)) {
    return obj
      .map((item) => cleanNulls(item))
      .filter((item) => item !== undefined && item !== null);
  }

  if (typeof obj === "object") {
    const newObj: any = {};
    Object.keys(obj).forEach((key) => {
      const value = cleanNulls(obj[key]);
      if (value !== undefined && value !== null) {
        newObj[key] = value;
      }
    });
    // Se o objeto ficou vazio, mas não era vazio antes, talvez devêssemos mantê-lo?
    // Depende do caso. Para RxDB, um objeto vazio {} pode ser válido se propriedades forem opcionais.
    return newObj;
  }

  return obj;
}
