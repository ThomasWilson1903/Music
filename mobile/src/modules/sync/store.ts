import { useStore } from "zustand";

import { createPersistedStore } from "~/lib/zustand";

export interface SyncStore {
  serverBaseUrl: string;
  knownServerUrls: string[];
  lastSyncTime: number;
  status: string;
  syncing: boolean;
}

export const syncStore = createPersistedStore<SyncStore>(
  () => ({
    serverBaseUrl: "",
    knownServerUrls: [],
    lastSyncTime: 0,
    status: "Нажмите кнопку синхронизации",
    syncing: false,
  }),
  {
    name: "music::sync",
  },
);

export function useSyncStore<T>(selector: (s: SyncStore) => T): T {
  return useStore(syncStore, selector);
}
