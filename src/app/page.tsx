"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import openingImg from "@/assets/images/opening-page.png";
import { useRouter } from "next/navigation";
import { useInitialSyncStatus } from "@/hooks/useInitialSyncStatus";
import { Loader2 } from "lucide-react";

export default function OpeningPage() {
  const router = useRouter();
  const {
    isComplete,
    counts,
    progressPercentage,
    isLoadingRemote,
    totalRemoteCounts,
    dbError,
  } = useInitialSyncStatus();
  const [canRedirect, setCanRedirect] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);

  // Timer mínimo para mostrar a splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanRedirect(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  // Timer para mostrar botão de pular se demorar muito
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkipButton(true);
    }, 10000); // 10 segundos

    return () => clearTimeout(timer);
  }, []);

  // Redireciona apenas quando o tempo mínimo passou E sync completo
  useEffect(() => {
    if (canRedirect && isComplete) {
      router.push("/login");
    }
  }, [canRedirect, isComplete, router]);

  const totalAnimals = counts.animals;
  const totalRemoteAnimals = totalRemoteCounts.animals;

  const totalVaccines = counts.vaccines;
  const totalRemoteVaccines = totalRemoteCounts.vaccines;

  const totalFarms = counts.farms;
  const totalRemoteFarms = totalRemoteCounts.farms;

  const totalMatriz = counts.matriz;
  const totalRemoteMatriz = totalRemoteCounts.matriz;

  const totalLocal = totalAnimals + totalVaccines + totalFarms + totalMatriz;
  const totalRemote =
    totalRemoteAnimals +
    totalRemoteVaccines +
    totalRemoteFarms +
    totalRemoteMatriz;

  return (
    <AnimatePresence>
      <motion.main
        key="opening"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
        }}
        transition={{
          duration: 1.2,
          ease: "easeInOut",
        }}
        className="relative top-0 left-0 h-dvh w-full overflow-hidden"
      >
        <Image
          src={openingImg}
          alt="Cow App Logo"
          fill
          className="w-full h-full object-cover"
          priority
        />

        {/* Loading Indicator & Progress Bar */}
        <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center justify-center text-white z-10 px-8">
          <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl w-full max-w-md border border-white/10 shadow-2xl">
            {dbError ? (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-xs">
                <p className="font-bold mb-1">
                  Erro ao iniciar banco de dados:
                </p>
                <p className="mb-2">{dbError.message}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-medium"
                  >
                    Recarregar
                  </button>
                  <button
                    onClick={() => router.push("/login")}
                    className="flex-1 px-3 py-2 bg-white/10 text-white rounded hover:bg-white/20 transition-colors font-medium"
                  >
                    Continuar Offline
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-green-400" />
                    <span className="text-sm font-medium text-white">
                      {isLoadingRemote
                        ? "Conectando ao servidor..."
                        : isComplete
                        ? "Iniciando..."
                        : "Sincronizando dados..."}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-green-400">
                    {progressPercentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
                  <motion.div
                    className="bg-green-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="flex justify-between text-xs text-white/60">
                  <span>Animais</span>
                  <span>{totalAnimals} itens baixados</span>
                  <span>
                    Total: {isLoadingRemote ? "..." : totalRemoteAnimals}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-white/60">
                  <span>Vacinas</span>
                  <span>{totalVaccines} itens baixados</span>
                  <span>
                    Total: {isLoadingRemote ? "..." : totalRemoteVaccines}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-white/60">
                  <span>Fazendas</span>
                  <span>{totalFarms} itens baixados</span>
                  <span>
                    Total: {isLoadingRemote ? "..." : totalRemoteFarms}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-white/60">
                  <span>Matriz</span>
                  <span>{totalMatriz} itens baixados</span>
                  <span>
                    Total: {isLoadingRemote ? "..." : totalRemoteMatriz}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-white/60">
                  <span>Total</span>
                  <span>{totalLocal} itens baixados</span>
                  <span>Total: {isLoadingRemote ? "..." : totalRemote}</span>
                </div>
              </>
            )}

            {showSkipButton && !isComplete && !dbError && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => router.push("/login")}
                className="mt-4 w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-xs font-medium border border-white/10"
              >
                Demorando muito? Pular sincronização
              </motion.button>
            )}
          </div>
        </div>
      </motion.main>
    </AnimatePresence>
  );
}
