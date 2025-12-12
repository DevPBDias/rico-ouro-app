"use client";

import { useState, useEffect } from "react";
import { useSyncStatus } from "@/hooks/sync/useSyncStatus";
import {
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

export function SyncStatusIndicator() {
  const [isMounted, setIsMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    status,
    pendingCount,
    isSyncing,
    isOffline,
    hasPending,
    triggerSync,
  } = useSyncStatus();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case "synced":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "syncing":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case "offline":
        return <WifiOff className="w-4 h-4 text-yellow-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-orange-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "synced":
        return "bg-green-500";
      case "syncing":
        return "bg-blue-500";
      case "error":
        return "bg-red-500";
      case "offline":
        return "bg-yellow-500";
      case "pending":
        return "bg-orange-500";
      case "checking":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "synced":
        return "Sincronizado";
      case "syncing":
        return "Sincronizando...";
      case "error":
        return "Erro ao sincronizar";
      case "offline":
        return "Offline";
      case "pending":
        return `${pendingCount} pendente${pendingCount !== 1 ? "s" : ""}`;
      case "checking":
        return "Verificando...";
      default:
        return "Desconhecido";
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Compact indicator (always visible) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-gray-200 hover:bg-white transition-colors"
      >
        {getStatusIcon()}
        <span className="text-xs font-medium text-gray-700">
          {getStatusText()}
        </span>
        {hasPending && !isSyncing && (
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
        )}
      </button>

      {/* Expanded panel */}
      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
                <span className="text-sm font-medium text-gray-800">
                  Status de Sincronização
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Conexão:</span>
              <span
                className={isOffline ? "text-yellow-600" : "text-green-600"}
              >
                {isOffline ? "Offline" : "Online"}
              </span>
            </div>

            {pendingCount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pendentes:</span>
                <span className="text-orange-600 font-medium">
                  {pendingCount}
                </span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status:</span>
              <span className="text-gray-800">{getStatusText()}</span>
            </div>
          </div>

          {!isOffline && !isSyncing && (
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={() => {
                  triggerSync();
                  setIsExpanded(false);
                }}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
                />
                Sincronizar agora
              </button>
            </div>
          )}

          {isOffline && (
            <div className="p-3 border-t border-gray-100 bg-yellow-50">
              <p className="text-xs text-yellow-800">
                Você está offline. As alterações serão sincronizadas quando a
                conexão voltar.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
