/**
 * SyncLogger — Logs estruturados para o sistema de replicação.
 *
 * Em SYNC_SAFE_MODE, todos os logs são emitidos no console com ícones.
 * Sempre mantém um buffer circular dos últimos 1000 logs para exportação.
 */

export type SyncLogLevel = "info" | "warn" | "error";

export interface SyncLogEntry {
  timestamp: number;
  level: SyncLogLevel;
  collection: string;
  message: string;
  data?: unknown;
}

const ICONS: Record<SyncLogLevel, string> = {
  info: "📘",
  warn: "⚠️",
  error: "🔴",
};

const MAX_LOG_SIZE = 1000;
const TRIM_TO = 500;

class SyncLoggerClass {
  private logs: SyncLogEntry[] = [];

  private get isSafeMode(): boolean {
    return (
      typeof window !== "undefined" &&
      process.env.NEXT_PUBLIC_SYNC_SAFE_MODE === "true"
    );
  }

  log(
    level: SyncLogLevel,
    collection: string,
    message: string,
    data?: unknown,
  ): void {
    const entry: SyncLogEntry = {
      timestamp: Date.now(),
      level,
      collection,
      message,
      data,
    };

    this.logs.push(entry);

    if (this.logs.length > MAX_LOG_SIZE) {
      this.logs = this.logs.slice(-TRIM_TO);
    }

    // Sempre logamos com ícone — em safe mode logamos tudo, senão só errors
    if (this.isSafeMode || level === "error") {
      const icon = ICONS[level];
      const tag = `${icon} [Sync/${collection}]`;
      if (data !== undefined) {
        console[level](`${tag} ${message}`, data);
      } else {
        console[level](`${tag} ${message}`);
      }
    }
  }

  info(collection: string, message: string, data?: unknown): void {
    this.log("info", collection, message, data);
  }

  warn(collection: string, message: string, data?: unknown): void {
    this.log("warn", collection, message, data);
  }

  error(collection: string, message: string, data?: unknown): void {
    this.log("error", collection, message, data);
  }

  /** Exporta todos os logs como JSON (para debug / suporte) */
  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /** Retorna apenas os logs de erro */
  getErrors(): SyncLogEntry[] {
    return this.logs.filter((l) => l.level === "error");
  }

  /** Retorna logs filtrados por collection */
  getByCollection(collection: string): SyncLogEntry[] {
    return this.logs.filter((l) => l.collection === collection);
  }

  /** Retorna os últimos N logs */
  getRecent(count = 50): SyncLogEntry[] {
    return this.logs.slice(-count);
  }

  /** Limpa todos os logs */
  clear(): void {
    this.logs = [];
  }
}

/** Instância singleton do SyncLogger */
export const SyncLogger = new SyncLoggerClass();
