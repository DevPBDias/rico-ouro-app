'use client';

import { useEffect, useState } from "react";
import {
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

export function SyncStatus() {
  const { isOnline, isSyncing, lastSync, syncNow, getPendingChanges } = useOfflineStatus();
  const [pendingChanges, setPendingChanges] = useState<{
    total: number;
    animals: number;
    vaccines: number;
    farms: number;
    matrizes: number;
  }>({ total: 0, animals: 0, vaccines: 0, farms: 0, matrizes: 0 });

  useEffect(() => {
    const updateCount = async () => {
      const changes = await getPendingChanges();
      setPendingChanges(changes);
    };

    updateCount();
    const interval = setInterval(updateCount, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [getPendingChanges]);

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `Há ${diffInMinutes} min`;
    if (diffInMinutes < 24 * 60) return `Hoje às ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-64">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <WifiOff className="w-5 h-5 text-yellow-500 mr-2" />
            )}
            <span className="font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            {isSyncing ? (
              <span className="flex items-center">
                <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                Sincronizando...
              </span>
            ) : (
              <button 
                onClick={() => syncNow()}
                disabled={!isOnline || isSyncing}
                className="text-blue-500 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Atualizar
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Última sincronização:</span>
            <span className="font-medium">{formatLastSync(lastSync)}</span>
          </div>
          
          {pendingChanges.total > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400 mb-1">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span>Alterações pendentes: {pendingChanges.total}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 mt-1">
                {pendingChanges.animals > 0 && (
                  <span>• {pendingChanges.animals} animal{pendingChanges.animals !== 1 ? 's' : ''}</span>
                )}
                {pendingChanges.vaccines > 0 && (
                  <span>• {pendingChanges.vaccines} vacina{pendingChanges.vaccines !== 1 ? 's' : ''}</span>
                )}
                {pendingChanges.farms > 0 && (
                  <span>• {pendingChanges.farms} fazenda{pendingChanges.farms !== 1 ? 's' : ''}</span>
                )}
                {pendingChanges.matrizes > 0 && (
                  <span>• {pendingChanges.matrizes} matriz{pendingChanges.matrizes !== 1 ? 'es' : ''}</span>
                )}
              </div>
            </div>
          )}
          
          {pendingChanges.total === 0 && lastSync && (
            <div className="flex items-center text-sm text-green-600 dark:text-green-400 mt-2">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>Tudo sincronizado</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
