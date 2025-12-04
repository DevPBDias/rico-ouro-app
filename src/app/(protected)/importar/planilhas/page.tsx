"use client";
import Header from "@/components/layout/Header";
import SearchCsvFile from "@/components/search/SearchCsvFile";
import { Button } from "@/components/ui/button";
import { useRxDatabase } from "@/providers/RxDBProvider";
import { Trash2, RefreshCw } from "lucide-react";
import { useState } from "react";

const ImportCsvFilesPage = () => {
  const db = useRxDatabase();
  const [isCleaning, setIsCleaning] = useState(false);

  const handleResetLocalDatabase = async () => {
    setIsCleaning(true);
    try {
      if (db) {
        console.log("Destruindo banco local...");
        await db.remove(); // Apaga dados e metadados locais
        console.log("Banco destruído. Recarregando...");
        window.location.reload();
      }
    } catch (error) {
      console.error("Erro ao resetar banco:", error);
      alert(
        "Erro ao resetar banco. Tente limpar os dados do navegador manualmente."
      );
      setIsCleaning(false);
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
        <p className="text-[10px] text-center text-white/60 mt-3 px-4">
          Isso resolverá problemas de sincronização apagando os dados locais e
          baixando tudo novamente do servidor.
        </p>
      </div>
    </main>
  );
};

export default ImportCsvFilesPage;
