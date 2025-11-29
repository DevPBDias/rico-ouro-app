"use client";

import { useEffect, useState } from "react";
import { useRxDB } from "@/providers";
import { useReplication } from "@/providers";

export function SyncDebugPanel() {
  const [isMounted, setIsMounted] = useState(false);
  const { db, isLoading } = useRxDB();
  const { isSyncing, lastSyncedAt, online, replicationErrors } =
    useReplication();
  const [counts, setCounts] = useState({
    animals: 0,
    vaccines: 0,
    farms: 0,
    matriz: 0,
  });

  // Only render on client-side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!db || isLoading) return;

    const updateCounts = async () => {
      try {
        const [animals, vaccines, farms, matriz] = await Promise.all([
          db.animals.count().exec(),
          db.vaccines.count().exec(),
          db.farms.count().exec(),
          db.matriz.count().exec(),
        ]);

        setCounts({ animals, vaccines, farms, matriz });
      } catch (error) {
        console.error("Error counting documents:", error);
      }
    };

    updateCounts();

    // Update counts every 2 seconds
    const interval = setInterval(updateCounts, 2000);

    return () => clearInterval(interval);
  }, [db, isLoading]);

  // Don't render on server-side to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
        <h3 className="font-bold mb-2">🔄 Carregando RxDB...</h3>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm z-50 text-sm">
      <h3 className="font-bold mb-3 text-lg">🔍 Debug de Sincronização</h3>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className={online ? "text-green-400" : "text-red-400"}>
            {online ? "🟢" : "🔴"}
          </span>
          <span>{online ? "Online" : "Offline"}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={isSyncing ? "text-yellow-400" : "text-gray-400"}>
            {isSyncing ? "🔄" : "⏸️"}
          </span>
          <span>{isSyncing ? "Sincronizando..." : "Inativo"}</span>
        </div>

        {lastSyncedAt && (
          <div className="text-xs text-gray-400">
            Última sync: {lastSyncedAt.toLocaleTimeString()}
          </div>
        )}

        <hr className="border-gray-700 my-2" />

        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-400 mb-1">
            Documentos no IndexedDB:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-blue-400">🐄 Animais:</span>{" "}
              <span className="font-mono">{counts.animals}</span>
            </div>
            <div>
              <span className="text-green-400">💉 Vacinas:</span>{" "}
              <span className="font-mono">{counts.vaccines}</span>
            </div>
            <div>
              <span className="text-yellow-400">🏡 Fazendas:</span>{" "}
              <span className="font-mono">{counts.farms}</span>
            </div>
            <div>
              <span className="text-purple-400">🐮 Matrizes:</span>{" "}
              <span className="font-mono">{counts.matriz}</span>
            </div>
          </div>
        </div>

        {replicationErrors.length > 0 && (
          <>
            <hr className="border-gray-700 my-2" />
            <div className="text-red-400 text-xs">
              <div className="font-semibold mb-1">❌ Erros:</div>
              {replicationErrors.map((error, i) => (
                <div key={i} className="truncate">
                  {error.message}
                </div>
              ))}
            </div>
          </>
        )}

        <hr className="border-gray-700 my-2" />

        <div className="text-xs text-gray-500">
          Abra o console do navegador (F12) para ver logs detalhados
        </div>
      </div>
    </div>
  );
}
