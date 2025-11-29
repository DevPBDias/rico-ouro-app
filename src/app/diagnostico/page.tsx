"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { getDatabase } from "@/db/client";

export default function DiagnosticoPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [envStatus, setEnvStatus] = useState<any>({});
  const [dbStatus, setDbStatus] = useState<string>("Pendente");

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    async function runDiagnostics() {
      addLog("🚀 Iniciando diagnóstico...");

      // 1. Verificar Variáveis de Ambiente
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      setEnvStatus({
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? "✅ Definido" : "❌ AUSENTE",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey
          ? "✅ Definido"
          : "❌ AUSENTE",
        NODE_ENV: process.env.NODE_ENV,
      });

      if (!supabaseUrl || !supabaseAnonKey) {
        addLog("❌ Erro fatal: Variáveis de ambiente do Supabase ausentes!");
        return;
      }

      // 2. Testar Conexão Supabase
      try {
        addLog("📡 Testando conexão com Supabase...");
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data, error } = await supabase.from("animals").select("count", { count: "exact", head: true });

        if (error) {
          addLog(`❌ Erro Supabase: ${error.message}`);
        } else {
          addLog(`✅ Conexão Supabase OK! (Count: ${data})`); // data is null for head:true with count, but successful request means connection works
        }
      } catch (err: any) {
        addLog(`❌ Exceção Supabase: ${err.message}`);
      }

      // 3. Testar RxDB
      try {
        addLog("💾 Inicializando RxDB...");
        const db = await getDatabase();
        
        if (db) {
            addLog(`✅ RxDB Inicializado: ${db.name}`);
            const collections = Object.keys(db.collections);
            addLog(`📚 Coleções: ${collections.join(", ")}`);
            setDbStatus("✅ Funcionando");
        } else {
            addLog("⚠️ RxDB retornou null (pode ser SSR?)");
        }

      } catch (err: any) {
        addLog(`❌ Erro RxDB: ${err.message}`);
        setDbStatus("❌ Falhou");
      }
    }

    runDiagnostics();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto bg-gray-900 text-white min-h-screen font-mono">
      <h1 className="text-3xl font-bold mb-6 text-green-400">
        Diagnóstico de Ambiente (Vercel)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-600 pb-2">
            Variáveis de Ambiente
          </h2>
          <pre className="text-sm">
            {JSON.stringify(envStatus, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-600 pb-2">
            Status do Banco Local
          </h2>
          <div className="text-2xl font-bold">{dbStatus}</div>
        </div>
      </div>

      <div className="bg-black p-4 rounded border border-gray-700 h-96 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-yellow-400 sticky top-0 bg-black pb-2">
          Logs de Execução
        </h2>
        {logs.map((log, i) => (
          <div key={i} className="mb-1 border-b border-gray-900 pb-1">
            {log}
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center text-gray-500 text-sm">
        Faça deploy desta página e acesse /diagnostico para verificar o ambiente de produção.
      </div>
    </div>
  );
}
