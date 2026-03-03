import { Image, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BookOpenIcon, PlusIcon } from "react-native-heroicons/solid";
import { SheetManager } from "react-native-actions-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { EntryCard, useEntries } from "../features/entries";
import { useLibrary } from "../features/books/hooks/use-library";
import { CloseButton, ScreenWrapper, timeAgo, useThemeColors } from "../shared";

const BookDetailScreen = () => {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const router = useRouter();
  const { books } = useLibrary();
  const { entries, removeEntry } = useEntries(bookId);
  const { background, muted } = useThemeColors();
  const book = books.find((b) => b.id === bookId);

  const handleEntryPress = (entryId: string) => {
    router.push({ pathname: "/entry-detail", params: { id: entryId, bookId } });
  };

  const handleNewEntry = () => {
    router.push({ pathname: "/entry-detail", params: { bookId } });
  };

  const handleLongPress = (entryId: string) => {
    SheetManager.show("delete-entry-sheet", {
      payload: { onConfirm: () => removeEntry(entryId) },
    });
  };

  if (!book) {
    return (
      <ScreenWrapper>
        <View className="flex-row items-center pt-[34px] pb-3">
          <CloseButton onPress={() => router.back()} />
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-sm">Book not found</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View className="flex-row items-center pt-[34px] pb-3">
        <CloseButton onPress={() => router.back()} />
        <View className="flex-1" />
        <View className="w-[30px]" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-6">
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="items-center pt-2 pb-6"
        >
          {book.coverUrl ? (
            <Image
              source={{ uri: book.coverUrl }}
              className="w-28 h-40 rounded-2xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-28 h-40 rounded-2xl bg-card items-center justify-center">
              <BookOpenIcon size={32} color={muted} />
            </View>
          )}
          <Text className="text-foreground font-serif text-xl font-semibold mt-5 text-center px-4">
            {book.title}
          </Text>
          <Text className="text-muted/80 text-sm mt-1">
            {book.authors.join(", ")}
          </Text>
          {(book.publisher || book.publishedDate) && (
            <Text className="text-muted/50 text-xs mt-1.5">
              {[book.publisher, book.publishedDate].filter(Boolean).join(" · ")}
            </Text>
          )}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(150)}
          className="flex-row items-center justify-between mb-3 mt-2"
        >
          <Text className="text-xs font-medium uppercase tracking-widest text-muted/70">
            Reflections ({entries.length})
          </Text>
          <Pressable
            onPress={handleNewEntry}
            className="flex-row items-center gap-1 bg-primary/10 rounded-full px-2.5 py-1"
          >
            <PlusIcon size={12} color={background} />
            <Text className="text-primary text-xs font-medium">New</Text>
          </Pressable>
        </Animated.View>

        <View className="gap-3">
          {entries.length > 0 ? (
            entries.map((entry, index) => (
              <Animated.View
                key={entry.id}
                entering={FadeInDown.duration(400).delay(250 + index * 100)}
              >
                <EntryCard
                  id={entry.id}
                  title={entry.bookTitle}
                  chapter={entry.chapter ? `Chapter ${entry.chapter}` : ""}
                  date={timeAgo(entry.date)}
                  snippet={entry.snippet}
                  reaction={entry.reflection ?? ""}
                  feeling={entry.feeling}
                  onPress={() => handleEntryPress(entry.id)}
                  onLongPress={() => handleLongPress(entry.id)}
                />
              </Animated.View>
            ))
          ) : (
            <Animated.View
              entering={FadeInDown.duration(400).delay(250)}
              className="items-center py-12"
            >
              <Text className="text-muted text-sm text-center leading-relaxed mb-4">
                No reflections yet.
              </Text>
              <Pressable
                onPress={handleNewEntry}
                className="flex-row items-center gap-1.5 bg-primary/10 rounded-full px-4 py-2"
              >
                <PlusIcon size={14} color={background} />
                <Text className="text-primary text-sm font-medium">Add first reflection</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default BookDetailScreen;
