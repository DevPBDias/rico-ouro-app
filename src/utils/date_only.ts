/**
 * DateOnly
 * Representa uma data sem timezone (YYYY-MM-DD)
 * Seguro contra UTC, locale e horário de verão
 */

export class DateOnly {
  readonly year: number;
  readonly month: number; // 1-12
  readonly day: number; // 1-31

  private constructor(year: number, month: number, day: number) {
    this.year = year;
    this.month = month;
    this.day = day;
  }

  /* =========================
   * FACTORIES
   * ========================= */

  /** Cria a partir de string YYYY-MM-DD */
  static fromISO(dateStr: string): DateOnly {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new Error(`Invalid DateOnly ISO format: ${dateStr}`);
    }

    const [y, m, d] = dateStr.split("-").map(Number);
    return new DateOnly(y, m, d);
  }

  /** Cria a partir de números */
  static fromParts(year: number, month: number, day: number): DateOnly {
    return new DateOnly(year, month, day);
  }

  /** Cria a partir de Date (usa horário seguro) */
  static fromDate(date: Date): DateOnly {
    return new DateOnly(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
    );
  }

  /* =========================
   * OPERATIONS
   * ========================= */

  /** Retorna nova data com dias adicionados */
  addDays(days: number): DateOnly {
    // Usa meio-dia para evitar DST
    const safeDate = new Date(this.year, this.month - 1, this.day, 12);
    safeDate.setDate(safeDate.getDate() + days);

    return DateOnly.fromDate(safeDate);
  }

  /* =========================
   * SERIALIZATION
   * ========================= */

  /** YYYY-MM-DD */
  toISO(): string {
    const y = this.year;
    const m = String(this.month).padStart(2, "0");
    const d = String(this.day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  /** Para usar em <input type="date"> */
  toInputValue(): string {
    return this.toISO();
  }

  /* =========================
   * UTILITIES
   * ========================= */

  equals(other: DateOnly): boolean {
    return (
      this.year === other.year &&
      this.month === other.month &&
      this.day === other.day
    );
  }

  isBefore(other: DateOnly): boolean {
    return this.toISO() < other.toISO();
  }

  isAfter(other: DateOnly): boolean {
    return this.toISO() > other.toISO();
  }
}
