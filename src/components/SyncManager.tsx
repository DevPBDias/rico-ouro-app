"use client";

import { useEffect, useState } from "react";
import { syncService } from "@/lib/sync-service";
import { isOnline, isSupabaseConfigured } from "@/lib/supabase-client";

export default function SyncManager() {
  const [, setOnline] = useState(false);
  const [, setSupabaseConfigured] = useState(false);

  useEffect(() => {
    // Verifica se Supabase está configurado
    const configured = isSupabaseConfigured();
    setSupabaseConfigured(configured);

    if (!configured) {
      console.warn(
        "⚠️ Supabase não configurado. A sincronização não será iniciada."
      );
      return;
    }

    // Verifica status online
    const checkOnline = () => {
      setOnline(isOnline());
    };

    checkOnline();
    const interval = setInterval(checkOnline, 5000);

    // Inicia sincronização automática
    syncService.startAutoSync(30000); // Sincroniza a cada 30 segundos
    console.log("✅ Sincronização automática iniciada");

    return () => {
      clearInterval(interval);
      syncService.stopAutoSync();
    };
  }, []);

  // Componente invisível (não renderiza nada visível, apenas gerencia a sincronização)
  return null;
}
