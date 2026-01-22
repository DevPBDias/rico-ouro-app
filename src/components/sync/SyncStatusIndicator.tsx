"use client";

import { useState, useEffect } from "react";
import { useSyncStatus } from "@/hooks/sync/useSyncStatus";
import { useRxDB } from "@/providers/RxDBProvider";
import {
  RefreshCw,
  WifiOff,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Cloud,
} from "lucide-react";
import { ConfirmModal } from "../modals/ConfirmModal";

export function SyncStatusIndicator() {
  const [isMounted, setIsMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const { status, online, isSyncing, triggerSync, lastSyncedAt, errors } =
    useSyncStatus();
  const { resetDatabase } = useRxDB();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case "synced":
        return <CheckCircle size={14} className="text-emerald-400" />;
      case "syncing":
        return <RefreshCw size={14} className="text-blue-400 animate-spin" />;
      case "offline":
        return <WifiOff size={14} className="text-amber-400" />;
      case "error":
        return <AlertCircle size={14} className="text-rose-500" />;
      default:
        return <Cloud size={14} className="text-slate-400" />;
    }
  };

  const getStatusText = () => {
    if (!online) return "Offline";
    if (isSyncing) return "Sincronizando";
    if (status === "error") return "Erro de Sync";
    return "Sincronizado";
  };

  if (!isMounted) return null;

  return (
    <div className="fixed z-99 top-4 right-2 flex flex-col items-end">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-full px-2.5 py-1.5 shadow-xl hover:bg-slate-800 transition-all border-b-2 border-b-white/5 active:scale-95"
      >
        {getStatusIcon()}
        <span className="text-[11px] font-bold text-slate-100 tracking-tight">
          {getStatusText()}
        </span>
        {isExpanded ? (
          <ChevronUp size={12} className="text-slate-500" />
        ) : (
          <ChevronDown size={12} className="text-slate-500" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 w-56 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="p-4 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Conexão
                </span>
                <span
                  className={`text-[10px] font-black uppercase ${
                    online ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {online ? "Online" : "Offline"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Status
                </span>
                <span className="text-[10px] font-black text-slate-200 uppercase">
                  {getStatusText()}
                </span>
              </div>
            </div>

            {lastSyncedAt && (
              <div className="pt-2 border-t border-slate-800">
                <p className="text-[9px] text-slate-400 flex items-center gap-1">
                  <RefreshCw size={8} />
                  Última atualização:{" "}
                  {lastSyncedAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            {errors && errors.length > 0 && (
              <div className="pt-2 border-t border-rose-900/40">
                <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <AlertCircle size={10} />
                  Detalhes do Erro
                </p>
                <div className="max-h-20 overflow-y-auto pr-1">
                  {errors.map((err, i) => (
                    <p
                      key={i}
                      className="text-[9px] text-rose-400/90 leading-tight mb-1 last:mb-0 break-all"
                    >
                      {err.message}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                triggerSync();
                setIsExpanded(false);
              }}
              disabled={isSyncing || !online}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-[11px] font-black rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-wider"
            >
              <RefreshCw
                size={14}
                className={isSyncing ? "animate-spin" : ""}
              />
              Forçar Sincronização
            </button>

            <button
              onClick={() => {
                setIsResetModalOpen(true);
              }}
              disabled={!online}
              className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800 disabled:text-slate-600 text-slate-300 text-[10px] font-bold rounded-xl transition-all shadow-sm active:scale-95 uppercase tracking-wider border border-slate-700/50"
            >
              <RefreshCw
                size={12}
                className={isSyncing ? "animate-spin" : ""}
              />
              Recriar Banco (Sinc Total)
            </button>

            {!online && (
              <p className="text-[9px] text-center text-amber-500/80 font-medium leading-tight">
                Funcionalidades de nuvem desativadas em modo offline.
              </p>
            )}
          </div>
        </div>
      )}
      <ConfirmModal
        open={isResetModalOpen}
        title="Recriar Banco de Dados"
        description="Esta ação apagará todos os dados locais e baixará tudo da nuvem novamente. O aplicativo será reiniciado. Deseja continuar?"
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={async () => {
          setIsResetModalOpen(false);
          setIsExpanded(false);
          await resetDatabase();
        }}
        confirmLabel="Recriar"
      />
    </div>
  );
}
