/**
 * PendingQueue — Rastreia documentos pendentes de sincronização.
 *
 * Mantém um mapa em memória para monitorar o estado de sync de cada doc.
 * NÃO persiste no IndexedDB (isso seria replicado para Supabase).
 */

export type SyncStatus = "pending" | "syncing" | "synced" | "error";

export interface PendingDocument {
  collection: string;
  docId: string;
  addedAt: number;
  attempts: number;
  lastAttempt: number | null;
  status: SyncStatus;
  error?: string;
}

class PendingQueueClass {
  private queue: Map<string, PendingDocument> = new Map();

  private key(collection: string, docId: string): string {
    return `${collection}:${docId}`;
  }

  /** Marca um documento como pendente de sincronização */
  add(collection: string, docId: string): void {
    const k = this.key(collection, docId);
    const existing = this.queue.get(k);

    if (existing && existing.status === "syncing") {
      return; // Não sobrescrever se já está sincronizando
    }

    this.queue.set(k, {
      collection,
      docId,
      addedAt: existing?.addedAt ?? Date.now(),
      attempts: existing?.attempts ?? 0,
      lastAttempt: existing?.lastAttempt ?? null,
      status: "pending",
    });
  }

  /** Marca como em progresso de sincronização */
  markSyncing(collection: string, docId: string): void {
    const k = this.key(collection, docId);
    const item = this.queue.get(k);
    if (item) {
      item.status = "syncing";
      item.lastAttempt = Date.now();
      item.attempts++;
    }
  }

  /** Marca como sincronizado (remove da fila) */
  markSynced(collection: string, docId: string): void {
    this.queue.delete(this.key(collection, docId));
  }

  /** Marca um batch inteiro de uma collection como sincronizado */
  markBatchSynced(collection: string, docIds: string[]): void {
    for (const docId of docIds) {
      this.queue.delete(this.key(collection, docId));
    }
  }

  /** Marca como erro com mensagem */
  markError(collection: string, docId: string, error: string): void {
    const k = this.key(collection, docId);
    const item = this.queue.get(k);
    if (item) {
      item.status = "error";
      item.error = error;
    }
  }

  /** Retorna todos os documentos pendentes */
  getPending(): PendingDocument[] {
    return [...this.queue.values()].filter((d) => d.status === "pending");
  }

  /** Retorna todos os documentos com erro */
  getErrors(): PendingDocument[] {
    return [...this.queue.values()].filter((d) => d.status === "error");
  }

  /** Retorna estatísticas gerais */
  getStats(): {
    pending: number;
    syncing: number;
    error: number;
    total: number;
  } {
    const values = [...this.queue.values()];
    return {
      pending: values.filter((d) => d.status === "pending").length,
      syncing: values.filter((d) => d.status === "syncing").length,
      error: values.filter((d) => d.status === "error").length,
      total: values.length,
    };
  }

  /** Retorna docs pendentes de uma collection específica */
  getByCollection(collection: string): PendingDocument[] {
    return [...this.queue.values()].filter(
      (d) => d.collection === collection,
    );
  }

  /** Limpa toda a fila */
  clear(): void {
    this.queue.clear();
  }
}

/** Instância singleton do PendingQueue */
export const PendingQueue = new PendingQueueClass();
