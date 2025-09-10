declare module "sql.js" {
  export interface SqlJsStatic {
    Database: new (data?: Uint8Array) => Database;
  }

  export interface Statement {
    bind(params?: any[]): void;
    step(): boolean;
    get(): any[] | null;
    getAsObject(params?: any[]): Record<string, any>;
    run(params?: any[]): void;
    free(): void;
  }

  export interface QueryExecResult {
    columns: string[];
    values: any[][];
  }

  export interface Database {
    exec(sql: string): QueryExecResult[];
    run(sql: string, params?: any[]): void;
    prepare(sql: string): Statement;
    export(): Uint8Array;
  }

  export default function initSqlJs(options?: {
    locateFile?: (file: string) => string;
  }): Promise<SqlJsStatic>;
}


