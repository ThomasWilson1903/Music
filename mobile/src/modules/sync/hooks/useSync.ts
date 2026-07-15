import * as MediaLibrary from "expo-media-library";

import { performSync } from "../SyncManager";
import { syncStore, useSyncStore } from "../store";

export function useSync() {
  const syncing = useSyncStore((s) => s.syncing);
  const status = useSyncStore((s) => s.status);
  const serverBaseUrl = useSyncStore((s) => s.serverBaseUrl);
  const lastSyncTime = useSyncStore((s) => s.lastSyncTime);

  const startSync = async () => {
    if (syncing) return;

    const { status: permStatus } =
      await MediaLibrary.requestPermissionsAsync();
    if (permStatus !== "granted") {
      syncStore.setState({ status: "Нет разрешения на доступ к медиатеке" });
      return;
    }

    syncStore.setState({ syncing: true });

    try {
      const downloaded = await performSync(serverBaseUrl, (text) => {
        syncStore.setState({ status: text });
      });

      const now = Date.now();
      syncStore.setState({
        status: `Синхронизировано файлов: ${downloaded.length}`,
        lastSyncTime: now,
        syncing: false,
      });
    } catch (err) {
      syncStore.setState({
        status:
          err instanceof Error ? err.message : "Ошибка синхронизации",
        syncing: false,
      });
    }
  };

  return { syncing, status, serverBaseUrl, lastSyncTime, startSync };
}
