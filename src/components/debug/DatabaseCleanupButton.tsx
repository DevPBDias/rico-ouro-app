"use client";

import { useState } from "react";
import { forceCleanDatabase, listDatabases } from "@/db/utils/manual-cleanup";
import { Button } from "@/components/ui/button";

export function DatabaseCleanupButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCleanup = async () => {
    const confirmed = window.confirm(
      "⚠️ ATENÇÃO!\n\n" +
        "Isso vai limpar o banco de dados local e recarregar a página.\n\n" +
        "Seus dados no Supabase estão seguros e serão sincronizados novamente.\n\n" +
        "Continuar?"
    );

    if (!confirmed) return;

    setIsLoading(true);
    await forceCleanDatabase();
  };

  const handleListDatabases = async () => {
    const dbs = await listDatabases();
    if (dbs.length === 0) {
      alert("Nenhum banco de dados encontrado.");
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <Button
        onClick={handleCleanup}
        disabled={isLoading}
        variant="destructive"
        size="sm"
        className="shadow-lg"
      >
        {isLoading ? "Limpando..." : "🧹 Limpar DB"}
      </Button>
      <Button
        onClick={handleListDatabases}
        variant="outline"
        size="sm"
        className="shadow-lg"
      >
        📦 Listar DBs
      </Button>
    </div>
  );
}
