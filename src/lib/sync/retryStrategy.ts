/**
 * Retry Strategy — Exponential backoff com jitter para replicação.
 *
 * Delays: 1s → 2s → 4s → 8s → 16s → 32s → 60s (cap)
 * Inclui jitter de 10% para evitar thundering herd.
 */

/** Calcula o delay para a próxima tentativa com exponential backoff + jitter */
export function getRetryDelay(attempt: number, baseDelay = 1000): number {
  const exponential = Math.min(baseDelay * Math.pow(2, attempt), 60000);
  const jitter = Math.random() * exponential * 0.1;
  return Math.round(exponential + jitter);
}

/** Verifica se deve continuar tentando */
export function shouldRetry(attempt: number, maxAttempts = 10): boolean {
  return attempt < maxAttempts;
}

/**
 * Executa uma função com retry automático e backoff exponencial.
 *
 * @param fn Função async a executar
 * @param label Label para logging
 * @param maxAttempts Número máximo de tentativas
 * @param baseDelay Delay base em ms
 * @returns Resultado da função ou throw após esgotar tentativas
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxAttempts = 5,
  baseDelay = 1000,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (!shouldRetry(attempt + 1, maxAttempts)) {
        break;
      }

      const delay = getRetryDelay(attempt, baseDelay);
      console.warn(
        `⏳ [Retry/${label}] Attempt ${attempt + 1}/${maxAttempts} failed. Retrying in ${delay}ms...`,
        lastError.message,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError ?? new Error(`${label}: All ${maxAttempts} attempts failed`);
}
