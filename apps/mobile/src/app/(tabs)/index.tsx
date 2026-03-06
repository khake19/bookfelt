import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import LinearGradient from "react-native-linear-gradient";
import { SheetManager } from "react-native-actions-sheet";
import { SHEET_IDS } from "../../shared/constants/sheet-ids";
import {
  EntryCard,
  getEmotionByLabel,
  useEntries,
} from "../../features/entries";
import { useLibrary } from "../../features/books/hooks/use-library";
import { PillButton, ScreenWrapper, timeAgo } from "../../shared";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const { books } = useLibrary();
  const { entries, removeEntry } = useEntries();
  const currentlyReading = books.find((b) => b.status === "reading");
  const bookEntries = useEntries(currentlyReading?.id).entries;
  const latestFeeling = bookEntries[0]?.feeling;
  const latestEmotion = latestFeeling
    ? getEmotionByLabel(latestFeeling)
    : undefined;

  const handlePress = (id: string) => {
    router.push({
      pathname: "/entry-detail",
      params: { id, bookId: currentlyReading?.id },
    });
  };

  const handleNewEntry = () => {
    router.push({
      pathname: "/entry-detail",
      params: { bookId: currentlyReading?.id },
    });
  };

  const handleLongPress = (entryId: string) => {
    SheetManager.show(SHEET_IDS.DELETE_ENTRY, {
      payload: { onConfirm: () => removeEntry(entryId) },
    });
  };

  return (
    <ScreenWrapper>
      <Animated.Text
        entering={FadeInDown.duration(400)}
        className="text-foreground font-mono-bold text-xl mt-2 mb-4"
      >
        bookfelt
      </Animated.Text>

      {currentlyReading && (
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <Pressable
            className="rounded-3xl overflow-hidden mb-6"
            onPress={() =>
              router.push({
                pathname: "/book-detail",
                params: { bookId: currentlyReading.id },
              })
            }
          >
            {currentlyReading.coverUrl ? (
              <ImageBackground
                source={{ uri: currentlyReading.coverUrl }}
                blurRadius={60}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={[
                    "rgba(0,0,0,0.7)",
                    "rgba(0,0,0,0.3)",
                    "rgba(0,0,0,0.15)",
                    "rgba(0,0,0,0.4)",
                    "rgba(0,0,0,0.65)",
                  ]}
                  locations={[0, 0.25, 0.5, 0.75, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flexDirection: "row", gap: 16, padding: 20 }}
                >
                  <Image
                    source={{ uri: currentlyReading.coverUrl }}
                    className="w-16 h-24 rounded-xl"
                    resizeMode="cover"
                  />
                  <View className="flex-1 justify-center">
                    <Text className="text-[10px] font-medium uppercase tracking-widest text-white/50 mb-1.5">
                      Currently reading
                    </Text>
                    <Text
                      className="text-white font-serif text-lg font-semibold leading-snug"
                      numberOfLines={2}
                    >
                      {currentlyReading.title}
                    </Text>
                    <Text
                      className="text-white/70 text-sm mt-0.5"
                      numberOfLines={1}
                    >
                      {currentlyReading.authors.join(", ")}
                    </Text>
                    {bookEntries.length > 0 && (
                      <Text className="text-white/40 text-xs mt-2">
                        {bookEntries.length}{" "}
                        {bookEntries.length === 1
                          ? "reflection"
                          : "reflections"}
                        {latestEmotion ? ` · ${latestEmotion.emoji}` : ""}
                      </Text>
                    )}
                  </View>
                </LinearGradient>
              </ImageBackground>
            ) : (
              <LinearGradient
                colors={[
                  "rgba(60,45,35,1)",
                  "rgba(75,55,40,1)",
                  "rgba(55,40,30,1)",
                ]}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flexDirection: "row", gap: 16, padding: 20 }}
              >
                <View className="flex-1 justify-center">
                  <Text className="text-[10px] font-medium uppercase tracking-widest text-background/40 mb-1.5">
                    Currently reading
                  </Text>
                  <Text
                    className="text-background font-serif text-lg font-semibold leading-snug"
                    numberOfLines={2}
                  >
                    {currentlyReading.title}
                  </Text>
                  <Text
                    className="text-background/50 text-sm mt-0.5"
                    numberOfLines={1}
                  >
                    {currentlyReading.authors.join(", ")}
                  </Text>
                  {bookEntries.length > 0 && (
                    <Text className="text-background/30 text-xs mt-2">
                      {bookEntries.length}{" "}
                      {bookEntries.length === 1 ? "reflection" : "reflections"}
                      {latestEmotion ? ` · ${latestEmotion.emoji}` : ""}
                    </Text>
                  )}
                </View>
              </LinearGradient>
            )}
          </Pressable>
        </Animated.View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-6"
      >
        <Animated.View
          entering={FadeInDown.duration(400).delay(250)}
          className="flex-row items-center justify-between mb-3"
        >
          <Text className="text-xs font-medium uppercase tracking-widest text-muted/70">
            Recent reflections
          </Text>
          {currentlyReading && (
            <PillButton
              icon="plus"
              label="New"
              onPress={handleNewEntry}
            />
          )}
        </Animated.View>
        <View className="gap-3">
          {entries.length > 0 ? (
            entries.map((entry, index) => (
              <Animated.View
                key={entry.id}
                entering={FadeInDown.duration(400).delay(350 + index * 100)}
              >
                <EntryCard
                  id={entry.id}
                  title={entry.bookTitle}
                  chapter={entry.chapter ? `Chapter ${entry.chapter}` : ""}
                  date={timeAgo(entry.date)}
                  snippet={entry.snippet}
                  reaction={entry.reflection ?? ""}
                  feeling={entry.feeling}
                  onPress={() => handlePress(entry.id)}
                  onLongPress={() => handleLongPress(entry.id)}
                />
              </Animated.View>
            ))
          ) : (
            <Animated.View
              entering={FadeInDown.duration(400).delay(350)}
              className="items-center py-12"
            >
              <Text className="text-muted text-sm text-center leading-relaxed">
                No reflections yet.{"\n"}
                {currentlyReading
                  ? "Tap + to log your first one."
                  : "Add a book to get started."}
              </Text>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
