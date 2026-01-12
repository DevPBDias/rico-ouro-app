/**
 * Estratégia de conflito para RxDB 16 seguindo a orientação do usuário:
 * O Supabase é a fonte da verdade para o campo 'updated_at' e para a resolução final.
 * O banco local apenas recebe o que vem do servidor e armazena para uso offline.
 */
// @ts-ignore
export const supabaseConflictHandler: any = async (
  input: any,
  _context: any
): Promise<any> => {
  const localDoc = input.newDocumentState;
  const masterDoc = input.realMasterState;

  // Se forem idênticos, não há conflito real
  if (JSON.stringify(localDoc) === JSON.stringify(masterDoc)) {
    return { isEqual: true };
  }

  /**
   * Seguindo a orientação do usuário: "O Supabase é quem lida com isso".
   * Usamos a estratégia "Server Wins" (o estado do servidor sempre prevalece).
   * Isso simplifica a lógica local e delega a responsabilidade para o Supabase,
   * que lida com o merge e atualiza o 'updated_at' via triggers no backend.
   */
  console.log(`🔀 [Conflict Resolver] Server wins for document mismatch.`);

  return {
    resolvedDoc: masterDoc,
  };
};
