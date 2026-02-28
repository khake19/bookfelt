import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PlusIcon } from "react-native-heroicons/solid";
import { EntryCard, useEntries } from "../../features/entries";
import { useLibrary } from "../../features/books/hooks/use-library";
import { ScreenWrapper, useThemeColors } from "../../shared";
import { useRouter } from "expo-router";

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { books } = useLibrary();
  const { entries } = useEntries();
  const { background } = useThemeColors();
  const currentlyReading = books.find((b) => b.status === "reading");

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
          <Pressable className="bg-foreground rounded-2xl p-4 mb-5">
            <Text className="text-xs font-medium uppercase tracking-widest text-background/50 mb-2">
              Currently reading
            </Text>
            <Text className="text-background font-serif text-lg font-semibold">
              {currentlyReading.title}
            </Text>
            <Text className="text-background/60 text-sm">
              {currentlyReading.authors.join(", ")}
            </Text>
          </Pressable>
        </Animated.View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-6"
      >
        <Animated.View
          entering={FadeInDown.duration(400).delay(250)}
          className="flex-row items-center justify-between mb-2"
        >
          <Text className="text-xs font-medium uppercase tracking-widest text-muted">
            Recent reflections
          </Text>
          {currentlyReading && (
            <Pressable
              onPress={handleNewEntry}
              className="flex-row items-center gap-1 bg-primary/10 rounded-full px-2.5 py-1"
            >
              <PlusIcon size={12} color={background} />
              <Text className="text-primary text-xs font-medium">New</Text>
            </Pressable>
          )}
        </Animated.View>
        <View className="gap-2">
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
