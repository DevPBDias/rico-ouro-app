import { OfflineDB } from '@/lib/offline/db-offline';

declare global {
  interface Window {
    offlineDB: OfflineDB;
  }
}

export {};
