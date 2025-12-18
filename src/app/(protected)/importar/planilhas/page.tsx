"use client";
import Header from "@/components/layout/Header";
import SearchCsvFile from "@/components/search/SearchCsvFile";
import { Button } from "@/components/ui/button";
import { useRxDatabase } from "@/providers/RxDBProvider";
import { Trash2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase/client";

import { clearAllDatabases } from "@/db/client";

const ImportCsvFilesPage = () => {
  const db = useRxDatabase();
  const [isCleaning, setIsCleaning] = useState(false);
  const [isCleaningGlobal, setIsCleaningGlobal] = useState(false);

  const handleResetLocalDatabase = async () => {
    setIsCleaning(true);
    try {
      console.log("Destruindo todos os bancos locais...");
      await clearAllDatabases();
      console.log("Bancos destruídos. Recarregando...");
      window.location.reload();
    } catch (error) {
      console.error("Erro ao resetar banco:", error);
      alert(
        "Erro ao resetar banco. Tente limpar os dados do navegador manualmente."
      );
      setIsCleaning(false);
    }
  };

  const handleResetGlobalDatabase = async () => {
    const confirmText = "DELETAR TUDO";
    const userInput = prompt(
      `⚠️ ATENÇÃO: Esta ação irá DELETAR PERMANENTEMENTE todos os dados do banco global (Supabase)!\n\nIsso inclui:\n- Todos os animais\n- Todas as vacinas\n- Todas as fazendas\n- Todos os registros de vacinação\n- Todos os pesos e medições\n- Todos os eventos de reprodução\n\nEsta ação NÃO PODE SER DESFEITA!\n\nPara confirmar, digite: ${confirmText}`
    );

    if (userInput !== confirmText) {
      alert("Operação cancelada.");
      return;
    }

    setIsCleaningGlobal(true);
    try {
      const supabase = getSupabase();

      console.log("Deletando dados do banco global...");

      // Deletar na ordem correta (tabelas dependentes primeiro)
      await supabase.from("animal_vaccines").delete().neq("id", "");
      console.log("✓ animal_vaccines deletado");

      await supabase.from("animal_metrics_weight").delete().neq("id", "");
      console.log("✓ animal_metrics_weight deletado");

      await supabase.from("animal_metrics_ce").delete().neq("id", "");
      console.log("✓ animal_metrics_ce deletado");

      await supabase.from("reproduction_events").delete().neq("id", "");
      console.log("✓ reproduction_events deletado");

      await supabase.from("animals").delete().neq("rgn", "");
      console.log("✓ animals deletado");

      await supabase.from("vaccines").delete().neq("id", "");
      console.log("✓ vaccines deletado");

      await supabase.from("farms").delete().neq("id", "");
      console.log("✓ farms deletado");

      console.log("Banco global limpo com sucesso!");
      alert("Banco global deletado com sucesso! A página será recarregada.");

      // Também limpar o banco local para evitar conflitos
      if (db) {
        await db.remove();
      }

      window.location.reload();
    } catch (error) {
      console.error("Erro ao resetar banco global:", error);
      alert(
        "Erro ao resetar banco global. Verifique o console para mais detalhes."
      );
      setIsCleaningGlobal(false);
    }
  };

  return (
    <main className="pb-20">
      <Header title="Importar planilhas" />
      <SearchCsvFile />

      <div className="p-4 mt-8 border-t border-white/20 mx-4">
        <h3 className="text-white font-bold mb-4 text-center uppercase text-sm">
          Zona de Perigo
        </h3>
        <Button
          variant="destructive"
          className="w-full py-6 text-sm font-bold uppercase flex items-center gap-2 shadow-lg"
          onClick={handleResetLocalDatabase}
          disabled={isCleaning || !db}
        >
          {isCleaning ? <RefreshCw className="animate-spin" /> : <Trash2 />}
          {isCleaning ? "Limpando..." : "Apagar Banco de Dados Local"}
        </Button>
        <Button
          variant="destructive"
          className="w-full py-6 text-sm font-bold uppercase flex items-center gap-2 shadow-lg mt-4"
          onClick={handleResetGlobalDatabase}
          disabled={isCleaningGlobal || isCleaning}
        >
          {isCleaningGlobal ? (
            <RefreshCw className="animate-spin" />
          ) : (
            <Trash2 />
          )}
          {isCleaningGlobal ? "Limpando..." : "Apagar Banco de Dados Global"}
        </Button>
      </div>
    </main>
  );
};

export default ImportCsvFilesPage;
