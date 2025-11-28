"use client";

import { MyDatabase } from "./collections";

/**
 * Singleton global do RxDB
 * 
 * ✅ Garante que o banco seja criado APENAS UMA VEZ
 * ✅ Previne o erro DB9 de múltiplas instâncias
 * ✅ Reutiliza a mesma Promise em todas as chamadas
 */
let dbPromise: Promise<MyDatabase | null> | null = null;

/**
 * Retorna a instância única do banco RxDB
 * 
 * Se o banco ainda não foi criado, importa dinamicamente
 * o módulo client.ts e cria o banco.
 * 
 * Chamadas subsequentes retornam a mesma Promise.
 */
export function getDB(): Promise<MyDatabase | null> {
  if (!dbPromise) {
    console.log("🔵 getDB: Criando nova instância do RxDB...");
    dbPromise = import("./client")
      .then((mod) => mod.getDatabase())
      .catch((err) => {
        console.error("❌ getDB: Erro ao criar RxDB:", err);
        // Reset para permitir retry em caso de erro
        dbPromise = null;
        throw err;
      });
  } else {
    console.log("🟢 getDB: Reutilizando instância existente do RxDB");
  }
  
  return dbPromise;
}
