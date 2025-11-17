// Extend the ServiceWorkerRegistration interface to include the sync property
declare interface ServiceWorkerRegistration {
  sync?: {
    register: (tag: string) => Promise<void>;
    getTags: () => Promise<string[]>;
  };
}

// Extend the ServiceWorkerGlobalScope for the service worker context
declare interface SyncManager {
  register: (tag: string) => Promise<void>;
  getTags: () => Promise<string[]>;
}

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: string[];
  skipWaiting(): Promise<void>;
};

declare const clients: Clients;

declare interface Window {
  __WB_MANIFEST: string[];
}
