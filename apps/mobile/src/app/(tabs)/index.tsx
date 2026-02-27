import { Pressable, ScrollView, Text, View } from "react-native";
import { EntryCard, MOCK_ENTRIES } from "../../features/entries";
import { ScreenWrapper } from "../../shared";
import { useRouter } from "expo-router";

const CURRENT_BOOK = {
  title: "The Three-Body Problem",
  author: "Liu Cixin",
  chapter: 12,
  totalChapters: 35,
};

export default function HomeScreen() {
  const router = useRouter();

  const handlePress = (id: string) => {
    router.push({
      pathname: "/entry-detail",
      params: { id },
    });
  };

  const progress = Math.round(
    (CURRENT_BOOK.chapter / CURRENT_BOOK.totalChapters) * 100
  );

  return (
    <ScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-6"
      >
        <Text className="text-foreground font-mono-bold text-xl mt-2 mb-4">
          bookfelt
        </Text>

        <Pressable className="bg-foreground rounded-2xl p-4 mb-5">
          <Text className="text-xs font-medium uppercase tracking-widest text-background/50 mb-2">
            Currently reading
          </Text>
          <Text className="text-background font-serif text-lg font-semibold">
            {CURRENT_BOOK.title}
          </Text>
          <Text className="text-background/60 text-sm mb-3">
            {CURRENT_BOOK.author}
          </Text>
          <View className="flex-row items-center gap-3">
            <View className="flex-1 h-1 rounded-full bg-background/20 overflow-hidden">
              <View
                className="h-full rounded-full bg-background/70"
                style={{ width: `${progress}%` }}
              />
            </View>
            <Text className="text-xs text-background/50">
              Ch. {CURRENT_BOOK.chapter}/{CURRENT_BOOK.totalChapters}
            </Text>
          </View>
        </Pressable>

        <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-2">
          Recent reflections
        </Text>
        <View className="gap-2">
          {MOCK_ENTRIES.map((entry) => (
            <EntryCard
              key={entry.id}
              {...entry}
              onPress={() => handlePress(entry.id)}
            />
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
