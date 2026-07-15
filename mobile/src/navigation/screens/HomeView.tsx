import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { useFavoriteListsForCards } from "~/data/favorite/queries";

import { NScrollLayout } from "~/navigation/layouts/NScrollLayout";

import { LegendList } from "~/components/Base/LegendList";
import { FilledIconButton } from "~/components/Form/Button/Icon";
import { TEm } from "~/components/Typography/StyledText";
import { useMediaCardListPreset } from "~/modules/media/components/MediaCard";
import { useSync } from "~/modules/sync/hooks/useSync";

export default function Home() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { syncing, startSync } = useSync();

  return (
    <NScrollLayout
      titleKey="term.home"
      Actions={
        <View className="flex-row items-center gap-1">
          <FilledIconButton
            icon="cached"
            accessibilityLabel="Sync"
            onPress={startSync}
            disabled={syncing}
          />
          <FilledIconButton
            icon="history"
            accessibilityLabel={t("feat.playedRecent.title")}
            onPress={() => navigation.navigate("RecentlyPlayed")}
          />
        </View>
      }
    >
      <TEm textKey="term.favorites" className="-mb-4" />
      <Favorites />
    </NScrollLayout>
  );
}

//#region Favorites
/** Display list of content we've favorited. */
function Favorites() {
  const { data } = useFavoriteListsForCards();
  const presets = useMediaCardListPreset({ data });
  return <LegendList {...presets} />;
}
//#endregion
