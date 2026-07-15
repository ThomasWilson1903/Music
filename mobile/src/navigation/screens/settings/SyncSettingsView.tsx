import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { ListLayout } from "~/navigation/layouts/ListLayout";

import { SegmentedList } from "~/components/List/Segmented";
import { syncStore, useSyncStore } from "~/modules/sync/store";

function normalizeUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `http://${trimmed}`;
}

export default function SyncSettings() {
  const serverBaseUrl = useSyncStore((s) => s.serverBaseUrl);
  const knownServerUrls = useSyncStore((s) => s.knownServerUrls);
  const [draftUrl, setDraftUrl] = useState(serverBaseUrl);

  const handleSave = () => {
    const normalized = normalizeUrl(draftUrl);
    if (!normalized) return;

    const known = knownServerUrls.includes(normalized)
      ? knownServerUrls
      : [...knownServerUrls, normalized].sort();

    syncStore.setState({
      serverBaseUrl: normalized,
      knownServerUrls: known,
    });
  };

  const handleSelect = (url: string) => {
    syncStore.setState({ serverBaseUrl: url });
    setDraftUrl(url);
  };

  const handleDelete = (url: string) => {
    const filtered = knownServerUrls.filter((u) => u !== url);
    syncStore.setState({
      knownServerUrls: filtered,
      serverBaseUrl: serverBaseUrl === url ? "" : serverBaseUrl,
    });
    if (serverBaseUrl === url) setDraftUrl("");
  };

  return (
    <ListLayout>
      <SegmentedList.CustomItem>
        <View className="gap-4 p-4">
          <View className="gap-2">
            <Text className="font-medium text-onSurface">
              URL сервера
            </Text>
            <Text className="text-sm text-onSurfaceVariant">
              {serverBaseUrl
                ? `Сейчас используется: ${serverBaseUrl}`
                : "Текущий сервер не выбран"}
            </Text>
          </View>

          <TextInput
            value={draftUrl}
            onChangeText={setDraftUrl}
            placeholder="http://192.168.31.59:8080"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            className="rounded-md bg-surfaceContainerHigh px-4 py-3 text-onSurface"
          />

          <SegmentedList.Item
            labelText="Сохранить сервер"
            onPress={handleSave}
            disabled={!draftUrl.trim()}
          />
        </View>
      </SegmentedList.CustomItem>

      {knownServerUrls.length > 0 && (
        <SegmentedList>
          {knownServerUrls.map((url) => (
            <SegmentedList.Item
              key={url}
              labelText={url}
              supportingText={
                url === serverBaseUrl ? "Текущий" : undefined
              }
              onPress={() => handleSelect(url)}
              RightElement={
                <Text
                  onPress={() => handleDelete(url)}
                  className="px-2 text-lg text-onSurfaceVariant"
                >
                  ×
                </Text>
              }
            />
          ))}
        </SegmentedList>
      )}
    </ListLayout>
  );
}
