'use client';

import { useEffect, useState } from "react";

export function ServiceWorkerRegister() {
  const [isOnline, setIsOnline] = useState(true);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            setRegistration(reg);

            if (reg.waiting) {
              setIsUpdateAvailable(true);
            }

            reg.addEventListener("updatefound", () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (
                    newWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    setIsUpdateAvailable(true);
                  }
                });
              }
            });
          })
          .catch((error) => {
          });
      });
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });

      const refresh = () => window.location.reload();
      navigator.serviceWorker.addEventListener("controllerchange", refresh, {
        once: true,
      });

      setTimeout(refresh, 5000);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {!isOnline && (
        <div className="bg-yellow-500 text-white px-4 py-2 rounded-md shadow-lg">
          Você está offline. As alterações serão sincronizadas quando a conexão
          voltar.
        </div>
      )}

      {isUpdateAvailable && (
        <div className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2">
          <span>Nova versão disponível!</span>
          <button
            onClick={handleUpdate}
            className="bg-white text-blue-500 px-2 py-1 rounded text-sm font-medium hover:bg-blue-50"
          >
            Atualizar
          </button>
        </div>
      )}
    </div>
  );
}
