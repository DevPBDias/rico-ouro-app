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
        return "Online";
      case "error":
        return "Não sincronizado";
      case "offline":
        return "Offline";
      case "checking":
        return "Verificando status...";
      default:
        return "Status desconhecido";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-row items-center gap-2">
      <p className="text-xs text-white">{getStatusTitle()}</p>
      <div
        className={`w-4 h-4 rounded-full ${getStatusColor()} shadow-lg border-2 border-white`}
      />
    </div>
  );
}

