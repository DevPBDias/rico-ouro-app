declare interface ServiceWorkerRegistration {
  sync?: {
    register: (tag: string) => Promise<void>;
    getTags: () => Promise<string[]>;
  };
}

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
