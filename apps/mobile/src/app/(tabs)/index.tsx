import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  Text,
  View,
} from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { BookOpenIcon } from "react-native-heroicons/outline";
import LinearGradient from "react-native-linear-gradient";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useLibrary } from "../../features/books/hooks/use-library";
import {
  EntryCard,
  useEmotionMap,
  useEntries,
  useRecentEntries,
} from "../../features/entries";
import type { Entry } from "../../features/entries";
import {
  PillButton,
  ScreenWrapper,
  timeAgo,
  useThemeColors,
} from "../../shared";
import { SHEET_IDS } from "../../shared/constants/sheet-ids";
import { useAuth } from "../../providers/AuthProvider";

export default function HomeScreen() {
  const router = useRouter();
  const { muted } = useThemeColors();
  const { user } = useAuth();
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ?? user?.email;
  const initial = (displayName ?? "?")[0].toUpperCase();
  const { books, primaryRead: currentlyReading } = useLibrary();
  const { entries, loadMore, hasMore, removeEntry } = useRecentEntries();
  const bookEntries = useEntries(currentlyReading?.id).entries;
  const emotionMap = useEmotionMap();
  const latestFeeling = bookEntries[0]?.feeling;
  const latestEmotion = latestFeeling
    ? emotionMap.get(latestFeeling)
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

  const renderItem = ({ item }: { item: Entry }) => (
    <Animated.View entering={FadeIn.duration(300)}>
      <EntryCard
        id={item.id}
        title={item.bookTitle}
        chapter={item.chapter ? `Chapter ${item.chapter}` : ""}
        date={timeAgo(item.date)}
        snippet={item.snippet}
        reaction={item.reflection ?? ""}
        feeling={item.feeling}
        reflectionUri={item.reflectionUri}
        onPress={() => handlePress(item.id)}
        onLongPress={() => handleLongPress(item.id)}
      />
    </Animated.View>
  );

  const ListHeader = (
    <>
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="flex-row items-center justify-between mt-2 mb-4 pr-1"
      >
        <Text className="text-foreground font-mono-bold text-xl">
          bookfelt
        </Text>
        <Pressable onPress={() => SheetManager.show(SHEET_IDS.PROFILE)}>
          <View className="w-9 h-9 rounded-full overflow-hidden items-center justify-center bg-primary">
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                className="w-full h-full"
              />
            ) : (
              <Text className="text-primary-foreground text-sm font-bold">
                {initial}
              </Text>
            )}
          </View>
        </Pressable>
      </Animated.View>

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
                blurRadius={80}
                resizeMode="cover"
                imageStyle={{ transform: [{ scale: 2 }] }}
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

      <Animated.View
        entering={FadeInDown.duration(400).delay(250)}
        className="flex-row items-center justify-between mb-3"
      >
        <Text className="text-xs font-medium uppercase tracking-widest text-muted/70">
          Recent reflections
        </Text>
        {currentlyReading && (
          <PillButton icon="plus" label="New" onPress={handleNewEntry} />
        )}
      </Animated.View>
    </>
  );

  const ListEmpty = (
    <Animated.View entering={FadeIn.duration(400)} className="items-center py-12">
      {books.length === 0 ? (
        <>
          <BookOpenIcon size={40} color={muted} />
          <Text className="text-muted text-sm text-center leading-relaxed mt-4">
            Your library is empty.{"\n"}Add your first book to get
            started.
          </Text>
          <Pressable
            onPress={() => router.push("/add-book")}
            className="flex-row items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mt-4"
          >
            <Text className="text-primary text-sm font-medium">
              Add a Book
            </Text>
          </Pressable>
        </>
      ) : (
        <Text className="text-muted text-sm text-center leading-relaxed">
          No reflections yet.{"\n"}Tap + to log your first one.
        </Text>
      )}
    </Animated.View>
  );

  return (
    <ScreenWrapper>
      <FlashList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={
          hasMore ? (
            <ActivityIndicator className="py-4" />
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        estimatedItemSize={120}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
      />
    </ScreenWrapper>
  );
}
