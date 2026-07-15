import { Directory, File, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library/legacy";

import { rescanForTracks } from "~/modules/scanning/helpers/rescan";

function endpoint(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export async function performSync(
  baseUrl: string,
  _downloadPath: string,
  onStatus: (text: string) => void,
): Promise<string[]> {
  if (!baseUrl) {
    throw new Error("Заполните URL сервера в настройках");
  }

  const downloadedFiles: string[] = [];

  onStatus("Получаем список файлов...");

  const listResponse = await fetch(endpoint(baseUrl, "api/music/list"));
  if (!listResponse.ok) {
    throw new Error(`Ошибка ${listResponse.status}`);
  }

  const fileList: string[] = await listResponse.json();
  console.log(`[Sync] Найдено файлов: ${fileList.length}`);

  const syncTempDir = new Directory(Paths.cache, "sync");
  if (!syncTempDir.exists) {
    syncTempDir.create();
  }

  const musicDir = new Directory(Paths.join(Paths.document, "Music"));
  if (!musicDir.exists) {
    musicDir.create();
  }

  onStatus("Проверяем существующие файлы...");
  const existingFiles = new Set<string>();
  for (const file of musicDir.list()) {
    existingFiles.add(file.name);
  }
  console.log(`[Sync] Локальных файлов: ${existingFiles.size}`);

  const newFiles = fileList.filter(
    (name) => !existingFiles.has(name.split("/").pop() || name),
  );
  console.log(
    `[Sync] Новых файлов: ${newFiles.length}, пропущено: ${fileList.length - newFiles.length}`,
  );

  for (const objectName of newFiles) {
    onStatus(`Скачивание ${objectName}`);

    const fileName = objectName.split("/").pop() || objectName;
    const downloadUrl = endpoint(baseUrl, `api/music/download/${encodeURIComponent(objectName)}`);
    const tempFile = new File(syncTempDir, fileName);
    const destFile = new File(musicDir, fileName);

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} при скачивании ${fileName}`);
      }
      const buffer = await response.arrayBuffer();
      await tempFile.write(new Uint8Array(buffer));
      console.log(`[Sync] Загружен: ${fileName} (${buffer.byteLength} байт)`);

      if (destFile.exists) {
        destFile.delete();
      }
      await tempFile.copy(musicDir);
      console.log(`[Sync] Сохранён в документах: ${destFile.uri}`);

      const asset = await MediaLibrary.createAssetAsync(tempFile.uri);
      console.log(`[Sync] Сохранён в Music: ${asset.uri}`);

      tempFile.delete();

      downloadedFiles.push(objectName);
    } catch (err) {
      if (tempFile.exists) tempFile.delete();
      console.error(`[Sync] Ошибка: ${err}`);
      throw err;
    }
  }

  if (downloadedFiles.length > 0) {
    onStatus("Сканирование библиотеки...");
    await rescanForTracks(false);
  }

  return downloadedFiles;
}
