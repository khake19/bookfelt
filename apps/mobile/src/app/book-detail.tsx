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
import { PlusIcon } from "react-native-heroicons/solid";
import { EllipsisHorizontalIcon } from "react-native-heroicons/outline";
import { SheetManager } from "react-native-actions-sheet";
import { SHEET_IDS } from "../shared/sheets";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getEmotionByLabel, useEntries } from "../features/entries";
import { useLibrary } from "../features/books/hooks/use-library";
import type { ReadingStatus } from "../features/books/types/book";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CloseButton, ScreenWrapper, timeAgo, useThemeColors } from "../shared";

const BookDetailScreen = () => {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const router = useRouter();
  const { books, updateStatus, removeBook, updateBook } = useLibrary();
  const { entries, removeEntry } = useEntries(bookId);
  const { background } = useThemeColors();
  const insets = useSafeAreaInsets();
  const book = books.find((b) => b.id === bookId);

  const handleEntryPress = (entryId: string) => {
    router.push({ pathname: "/entry-detail", params: { id: entryId, bookId } });
  };

  const handleNewEntry = () => {
    router.push({ pathname: "/entry-detail", params: { bookId } });
  };

  const handleLongPress = (entryId: string) => {
    SheetManager.show(SHEET_IDS.DELETE_ENTRY, {
      payload: { onConfirm: () => removeEntry(entryId) },
    });
  };

  const handleBookOptions = () => {
    if (!book) return;
    SheetManager.show(SHEET_IDS.ENTRY_OPTIONS, {
      payload: {
        onEdit: () => router.push({ pathname: "/book-edit", params: { bookId } }),
        onDelete: () => {
          removeBook(bookId);
          router.back();
        },
        onChangeStatus: (status: ReadingStatus) => {
          updateStatus(bookId, status);
          if (status === "finished") {
            SheetManager.show(SHEET_IDS.FINAL_THOUGHT, {
              payload: {
                firstImpression: book.firstImpression ?? "",
                onSave: (text) => updateBook(bookId, { finalThought: text }),
              },
            });
          }
        },
        currentStatus: book.status,
      },
    });
  };

  if (!book) {
    return (
      <ScreenWrapper>
        <View className="flex-row items-center pb-3" style={{ paddingTop: insets.top }}>
          <CloseButton onPress={() => router.back()} />
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-sm">Book not found</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-6">
        {/* Header with blurred cover background */}
        <Animated.View entering={FadeInDown.duration(400)}>
          {book.coverUrl ? (
            <ImageBackground
              source={{ uri: book.coverUrl }}
              blurRadius={60}
              resizeMode="cover"
            >
              <LinearGradient
                colors={[
                  "rgba(0,0,0,0.8)",
                  "rgba(0,0,0,0.4)",
                  "rgba(0,0,0,0.2)",
                  "rgba(0,0,0,0.5)",
                  "rgba(0,0,0,0.75)",
                ]}
                locations={[0, 0.25, 0.5, 0.75, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.3, y: 1 }}
              >
                <View className="px-5 pb-8" style={{ paddingTop: insets.top }}>
                  <View className="flex-row items-center justify-between">
                    <CloseButton onPress={() => router.back()} className="bg-white/20" />
                    <Pressable onPress={handleBookOptions} className="w-9 h-9 rounded-full bg-white/20 items-center justify-center">
                      <EllipsisHorizontalIcon size={20} color="white" />
                    </Pressable>
                  </View>
                  <View className="items-center mt-4">
                    <Image
                      source={{ uri: book.coverUrl }}
                      className="w-28 h-40 rounded-2xl"
                      resizeMode="cover"
                    />
                    <Text className="text-white font-serif text-xl font-semibold mt-5 text-center px-4">
                      {book.title}
                    </Text>
                    <Text className="text-white/70 text-sm mt-1">
                      {book.authors.join(", ")}
                    </Text>
                    {(book.publisher || book.publishedDate) && (
                      <Text className="text-white/40 text-xs mt-1.5">
                        {[book.publisher, book.publishedDate]
                          .filter(Boolean)
                          .join(" · ")}
                      </Text>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          ) : (
            <LinearGradient
              colors={["rgba(60,45,35,1)", "rgba(75,55,40,1)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View className="px-5 pb-8" style={{ paddingTop: insets.top }}>
                <View className="flex-row items-center justify-between">
                  <CloseButton onPress={() => router.back()} className="bg-white/20" />
                  <Pressable onPress={handleBookOptions} className="w-9 h-9 rounded-full bg-white/20 items-center justify-center">
                    <EllipsisHorizontalIcon size={20} color="white" />
                  </Pressable>
                </View>
                <View className="items-center mt-4">
                  <View className="w-28 h-40" />
                  <Text className="text-white font-serif text-xl font-semibold mt-5 text-center px-4">
                    {book.title}
                  </Text>
                  <Text className="text-white/70 text-sm mt-1">
                    {book.authors.join(", ")}
                  </Text>
                  {(book.publisher || book.publishedDate) && (
                    <Text className="text-white/40 text-xs mt-1.5">
                      {[book.publisher, book.publishedDate]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  )}
                </View>
              </View>
            </LinearGradient>
          )}
        </Animated.View>

        {/* Body */}
        <View className="px-5 pt-5">
          {/* Section header */}
          <Animated.View
            entering={FadeInDown.duration(400).delay(150)}
            className="flex-row items-center justify-between mb-5"
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

          {/* Timeline */}
          {entries.length > 0 ? (
            <View className="relative">
              {/* Vertical line */}
              <View className="absolute left-[5px] top-1.5 bottom-0 w-0.5 bg-border" />

              {entries.map((entry, index) => {
                const emotion = entry.feeling
                  ? getEmotionByLabel(entry.feeling)
                  : undefined;

                return (
                  <Animated.View
                    key={entry.id}
                    entering={FadeInDown.duration(400).delay(250 + index * 80)}
                  >
                    <Pressable
                      onPress={() => handleEntryPress(entry.id)}
                      onLongPress={() => handleLongPress(entry.id)}
                      className="flex-row mb-6"
                    >
                      {/* Dot */}
                      <View
                        className="w-3 h-3 rounded-full mt-1 z-10"
                        style={{
                          backgroundColor: emotion?.color ?? "#71717a",
                        }}
                      />

                      {/* Content */}
                      <View className="flex-1 ml-4">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-muted/60 text-xs">
                            {timeAgo(entry.date)}
                          </Text>
                          {entry.chapter && (
                            <Text className="text-muted/40 text-xs">
                              · Ch. {entry.chapter}
                            </Text>
                          )}
                        </View>

                        {entry.snippet ? (
                          <Text
                            className="text-foreground font-serif text-sm italic mt-1.5 leading-relaxed"
                            numberOfLines={2}
                          >
                            "{entry.snippet}"
                          </Text>
                        ) : null}

                        {entry.reflection ? (
                          <Text
                            className="text-muted/70 text-sm mt-1"
                            numberOfLines={1}
                          >
                            {entry.reflection}
                          </Text>
                        ) : null}

                        {emotion && (
                          <Text className="text-muted/50 text-xs mt-1.5">
                            {emotion.emoji} {emotion.label}
                          </Text>
                        )}
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
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
                <Text className="text-primary text-sm font-medium">
                  Add first reflection
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default BookDetailScreen;
