"use client";

import { useState, useEffect } from "react";
import { useSyncStatus } from "@/hooks/sync/useSyncStatus";
import { useReplication } from "@/providers/ReplicationProvider";
import {
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const ENTITY_NAMES: Record<string, string> = {
  animals: "Animais",
  vaccines: "Tipos de Vacina",
  farms: "Fazendas",
  animal_metrics_weight: "Pesagens",
  animal_metrics_ce: "Métricas CE",
  animal_vaccines: "Vacinas Aplicadas",
  reproduction_events: "Reprodução",
  animal_statuses: "Status de Animais",
  semen_doses: "Doses de Sêmen",
};

export function SyncStatusIndicator() {
  const [isMounted, setIsMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { status, online, isSyncing, triggerSync, lastSyncedAt } =
    useSyncStatus();
  const { entityStatus } = useReplication();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case "synced":
        return <CheckCircle size={14} className="text-green-500" />;
      case "syncing":
        return <RefreshCw size={14} className="text-blue-400 animate-spin" />;
      case "offline":
        return <WifiOff size={14} className="text-yellow-500" />;
      case "error":
        return <AlertCircle size={14} className="text-red-500" />;
      default:
        return <Clock size={14} className="text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "synced":
        return "Sincronizado";
      case "syncing":
        return "Sincronizando...";
      case "error":
        return "Erro de Sincronização";
      case "offline":
        return "Modo Offline";
      default:
        return "Verificando...";
    }
  };

  if (!isMounted) return null;

  return (
    <div className="fixed z-99 top-4 right-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-full px-2 py-1 shadow-2xl hover:bg-slate-800 transition-all group"
      >
        {getStatusIcon()}
        <span className="text-xs font-semibold text-slate-100">
          {getStatusText()}
        </span>
        {isExpanded ? (
          <ChevronUp size={14} className="text-slate-400" />
        ) : (
          <ChevronDown size={14} className="text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="absolute top-full right-0 mt-3 w-72 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-4 border-b border-slate-800 bg-slate-800/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <RefreshCw
                  size={16}
                  className={
                    isSyncing ? "animate-spin text-blue-400" : "text-slate-400"
                  }
                />
                Status de Dados
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  online
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {online ? "Online" : "Offline"}
              </span>
            </div>
            {lastSyncedAt && (
              <p className="text-[10px] text-slate-400 mt-1">
                Última sincronização: {lastSyncedAt.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
            {Object.entries(entityStatus).length > 0 ? (
              Object.entries(entityStatus).map(([key, state]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-xs text-slate-300">
                    {ENTITY_NAMES[key] || key}
                  </span>
                  <div className="flex items-center gap-2">
                    {state.isSyncing ? (
                      <RefreshCw
                        size={12}
                        className="text-blue-400 animate-spin"
                      />
                    ) : state.error ? (
                      <AlertCircle size={12} className="text-red-500" />
                    ) : (
                      <CheckCircle size={12} className="text-green-500" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">
                Iniciando conexões...
              </p>
            )}
          </div>

          <div className="p-3 bg-slate-800/30 border-t border-slate-800">
            <button
              onClick={() => {
                triggerSync();
                setIsExpanded(false);
              }}
              disabled={isSyncing || !online}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg active:scale-95"
            >
              <RefreshCw
                size={14}
                className={isSyncing ? "animate-spin" : ""}
              />
              Forçar Sincronização
            </button>
            {!online && (
              <p className="text-[10px] text-center text-yellow-500 mt-2 font-medium">
                Conecte-se à internet para sincronizar
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
