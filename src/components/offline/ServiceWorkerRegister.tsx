'use client';

import { useEffect, useState } from 'react';
import { syncService } from '@/lib/sync-service';

export function ServiceWorkerRegister() {
  const [isOnline, setIsOnline] = useState(true);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Inicia sincronização automática
    syncService.startAutoSync(30000);

    // Check if service workers are supported
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      // Register service worker
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw-offline.js')
          .then((reg) => {
            console.log('ServiceWorker registration successful');
            setRegistration(reg);

            // Check for updates
            if (reg.waiting) {
              setIsUpdateAvailable(true);
            }

            // Listen for updates
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    setIsUpdateAvailable(true);
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error('ServiceWorker registration failed:', error);
          });
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_REQUEST') {
          syncService.forceSync().catch(console.error);
        }
      });
    }

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Send message to service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page when the new service worker takes control
      const refresh = () => window.location.reload();
      navigator.serviceWorker.addEventListener('controllerchange', refresh, { once: true });
      
      // If no controller change after 5s, reload anyway
      setTimeout(refresh, 5000);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {!isOnline && (
        <div className="bg-yellow-500 text-white px-4 py-2 rounded-md shadow-lg">
          Você está offline. As alterações serão sincronizadas quando a conexão voltar.
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
