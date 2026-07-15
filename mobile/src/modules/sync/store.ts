import { useStore } from "zustand";

import { createPersistedStore } from "~/lib/zustand";

export interface SyncStore {
  serverBaseUrl: string;
  knownServerUrls: string[];
  lastSyncTime: number;
  status: string;
  syncing: boolean;
  downloadPath: string;
}

export const syncStore = createPersistedStore<SyncStore>(
  () => ({
    serverBaseUrl: "",
    knownServerUrls: [],
    lastSyncTime: 0,
    status: "Нажмите кнопку синхронизации",
    syncing: false,
    downloadPath: "Music/Twilson",
  }),
  {
    name: "music::sync",
    partialize: (state) => ({
      serverBaseUrl: state.serverBaseUrl,
      knownServerUrls: state.knownServerUrls,
      lastSyncTime: state.lastSyncTime,
      downloadPath: state.downloadPath,
    }),
  },
);

export function useSyncStore<T>(selector: (s: SyncStore) => T): T {
  return useStore(syncStore, selector);
}
