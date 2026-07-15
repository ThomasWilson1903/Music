import { Directory, File, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

function endpoint(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export async function performSync(
  baseUrl: string,
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

  const syncTempDir = new Directory(Paths.cache, "sync");
  if (!syncTempDir.exists) {
    syncTempDir.create();
  }

  for (const objectName of fileList) {
    onStatus(`Скачивание ${objectName}`);

    const downloadUrl = endpoint(baseUrl, `api/music/download/${objectName}`);
    const fileName = objectName.split("/").pop() || objectName;
    const tempFile = new File(syncTempDir, fileName);

    try {
      const downloaded = await File.downloadFileAsync(downloadUrl, tempFile);

      const asset = await MediaLibrary.createAssetAsync(downloaded.uri);
      if (asset) {
        downloadedFiles.push(objectName);
      }
    } finally {
      if (tempFile.exists) {
        tempFile.delete();
      }
    }
  }

  return downloadedFiles;
}
