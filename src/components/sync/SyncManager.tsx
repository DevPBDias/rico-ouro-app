"use client";

import { useEffect } from "react";

/**
 * SyncManager - Gerenciador de sincronização
 *
 * A sincronização agora é automática via RxDB Replication.
 * Este componente foi mantido para compatibilidade, mas a replicação
 * é iniciada automaticamente em src/db/rxdb.ts
 */
export default function SyncManager() {
  useEffect(() => {
    console.log(
      "✅ RxDB Replication está ativo (configurado em src/db/rxdb.ts)"
    );
  }, []);

  // Componente invisível (não renderiza nada visível)
  return null;
}
