import { ConflictResolver, ReplicableEntity } from "./types";

/**
 * Estratégia de conflito: Last Write Wins (LWW)
 * 
 * O documento com updated_at mais recente vence.
 * Esta é a estratégia padrão e mais comum para dados de estado.
 * 
 * @example
 * // Local: { name: "A", updated_at: "2024-01-01T10:00:00Z" }
 * // Remote: { name: "B", updated_at: "2024-01-01T11:00:00Z" }
 * // Result: { name: "B", ... } (remote vence pois é mais recente)
 */
export function lastWriteWins<T extends ReplicableEntity>(
  localDoc: T,
  remoteDoc: T,
): T {
  // MODO DE RECUPERAÇÃO: Se a flag estiver ativa, o cliente SEMPRE vence.
  // Útil quando o servidor tem timestamps corrompidos no futuro.
  const forceClient =
    typeof window !== "undefined" &&
    (window as any).NEXT_PUBLIC_SYNC_FORCE_CLIENT_WINS === "true";

  if (forceClient) {
    console.warn(
      `🚀 [Conflict] Force Client Wins mode active for ${localDoc.updated_at}`,
    );
    return localDoc;
  }

  const localTime = localDoc.updated_at || 0;
  const remoteTime = remoteDoc.updated_at || 0;

  if (localTime > remoteTime) {
    console.log(
      `🔀 [Conflict] Local wins (${localDoc.updated_at} > ${remoteDoc.updated_at})`,
    );
    return localDoc;
  } else {
    console.log(
      `🔀 [Conflict] Remote wins (${remoteDoc.updated_at} >= ${localDoc.updated_at})`,
    );
    return remoteDoc;
  }
}

/**
 * Estratégia de conflito: Server Wins
 *
 * O documento remoto (servidor) sempre vence.
 * Use para dados onde o servidor é a fonte de verdade (ex: configurações).
 */
export function serverWins<T extends ReplicableEntity>(
  _localDoc: T,
  remoteDoc: T
): T {
  console.log(`🔀 [Conflict] Server wins (always)`);
  return remoteDoc;
}

/**
 * Estratégia de conflito: Client Wins
 *
 * O documento local (cliente) sempre vence.
 * Use para dados onde o cliente é a fonte de verdade (ex: rascunhos).
 */
export function clientWins<T extends ReplicableEntity>(
  localDoc: T,
  _remoteDoc: T
): T {
  console.log(`🔀 [Conflict] Client wins (always)`);
  return localDoc;
}

/**
 * Estratégia de conflito: Merge Fields
 *
 * Faz merge dos campos, priorizando valores não-nulos do documento mais recente.
 * Use quando você quer preservar dados de ambos os lados.
 *
 * @param priorityFields Campos que sempre vêm do documento mais recente
 */
export function mergeFields<T extends ReplicableEntity>(
  priorityFields: (keyof T)[] = []
): ConflictResolver<T> {
  return (localDoc: T, remoteDoc: T): T => {
    const localTime = new Date(
      localDoc.updated_at || "1970-01-01T00:00:00.000Z"
    ).getTime();
    const remoteTime = new Date(
      remoteDoc.updated_at || "1970-01-01T00:00:00.000Z"
    ).getTime();

    const winner = localTime > remoteTime ? localDoc : remoteDoc;
    const loser = localTime > remoteTime ? remoteDoc : localDoc;

    const merged = { ...loser, ...winner };

    // Campos prioritários sempre vêm do documento mais recente
    for (const field of priorityFields) {
      (merged as Record<string, unknown>)[field as string] = winner[field];
    }

    console.log(
      `🔀 [Conflict] Merged fields (winner: ${
        winner === localDoc ? "local" : "remote"
      })`
    );
    return merged;
  };
}

/**
 * Factory para criar um resolver customizado.
 * 
 * @example
 * const customResolver = createResolver<Animal>((local, remote) => {
 *   // Lógica customizada de merge
 *   if (local.status === 'ATIVO' && remote.status !== 'ATIVO') {
 *     return local; // Preserva status ativo
 *   }
 *   return lastWriteWins(local, remote);
 * });
 */
export function createResolver<T extends ReplicableEntity>(
  resolver: ConflictResolver<T>
): ConflictResolver<T> {
  return resolver;
}
