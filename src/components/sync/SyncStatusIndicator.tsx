"use client";

import { useSyncStatus } from "@/hooks/useSyncStatus";

export function SyncStatusIndicator() {
  const { status } = useSyncStatus();

  const getStatusColor = () => {
    switch (status) {
      case "synced":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "offline":
        return "bg-yellow-500";
      case "checking":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case "synced":
        return "Banco sincronizado com Supabase";
      case "error":
        return "Erro na sincronização ou não sincronizado";
      case "offline":
        return "Sem conexão com a internet";
      case "checking":
        return "Verificando status...";
      default:
        return "Status desconhecido";
    }
  };

  return (
    <div
      className="fixed top-4 right-4 z-50"
      title={getStatusTitle()}
    >
      <div
        className={`w-4 h-4 rounded-full ${getStatusColor()} shadow-lg border-2 border-white`}
      />
    </div>
  );
}

