import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import LinearGradient from "react-native-linear-gradient";
import { EllipsisHorizontalIcon, MicrophoneIcon } from "react-native-heroicons/outline";
import { SheetManager } from "react-native-actions-sheet";
import { SHEET_IDS } from "../shared/constants/sheet-ids";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getEmotionByLabel, useEntries } from "../features/entries";
import { useLibrary } from "../features/books/hooks/use-library";
import type { ReadingStatus } from "../features/books/types/book";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CloseButton, PillButton, RichTextPreview, ScreenWrapper, stripHtml, timeAgo, useThemeColors } from "../shared";
import AudioPlayer from "../features/entries/components/AudioPlayer";

function RippleDot({ color }: { color: string }) {
  const ripple1 = useSharedValue(0);
  const ripple2 = useSharedValue(0);

  useEffect(() => {
    ripple1.value = withRepeat(withTiming(1, { duration: 2000 }), -1, false);
    ripple2.value = withDelay(
      700,
      withRepeat(withTiming(1, { duration: 2000 }), -1, false)
    );
  }, []);

  const ring1Style = useAnimatedStyle(() => ({
    position: "absolute" as const,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: color,
    opacity: 1 - ripple1.value,
    transform: [{ scale: 1 + ripple1.value * 1.2 }],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    position: "absolute" as const,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: color,
    opacity: 1 - ripple2.value,
    transform: [{ scale: 1 + ripple2.value * 1.2 }],
  }));

  return (
    <View className="w-3 h-3 items-center justify-center mt-1 z-10">
      <Animated.View style={ring1Style} />
      <Animated.View style={ring2Style} />
      <View
        className="w-3 h-3 rounded-full absolute"
        style={{ backgroundColor: color }}
      />
    </View>
  );
}

const BookDetailScreen = () => {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const router = useRouter();
  const { books, updateStatus, removeBook, updateBook } = useLibrary();
  const { entries, removeEntry } = useEntries(bookId);
  const { primary, background } = useThemeColors();
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
        onChangeStatus: (status: ReadingStatus | "put-down") => {
          if (status === "put-down") {
            router.push({ pathname: "/exit-interview", params: { bookId } });
            return;
          }
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-6" stickyHeaderIndices={[1]}>
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
                    <CloseButton onPress={() => router.back()} variant="overlay" />
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
                  <CloseButton onPress={() => router.back()} variant="overlay" />
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

        {/* Sticky section header */}
        <View
          className="z-10"
          style={{ paddingTop: insets.top, backgroundColor: background }}
        >
          <Animated.View
            entering={FadeInDown.duration(400).delay(150)}
            className="flex-row items-center justify-between px-5 pb-3"
          >
            <Text className="text-xs font-medium uppercase tracking-widest text-muted/70">
              Reflections ({entries.length})
            </Text>
            <PillButton
              icon="plus"
              label="New"
              onPress={handleNewEntry}
            />
          </Animated.View>
        </View>

        {/* Body */}
        <View className="px-5">
          {/* Fin marker */}
          {book.status === "finished" && (
            <Animated.View
              entering={FadeInDown.duration(400).delay(150)}
              className="flex-row items-center mb-5 gap-3"
            >
              <View className="flex-1 h-px bg-primary/20" />
              <Text className="text-primary font-serif-italic text-sm italic">
                Fin.
              </Text>
              <View className="flex-1 h-px bg-primary/20" />
            </Animated.View>
          )}

          {/* Paused marker */}
          {book.status === "paused" && (
            <Animated.View
              entering={FadeInDown.duration(400).delay(150)}
              className="flex-row items-center mb-5 gap-3"
            >
              <View className="flex-1 h-px bg-muted/20" />
              <Text className="text-muted font-serif-italic text-sm italic">
                Paused
              </Text>
              <View className="flex-1 h-px bg-muted/20" />
            </Animated.View>
          )}

          {/* DNF marker */}
          {book.status === "dnf" && (
            <Animated.View
              entering={FadeInDown.duration(400).delay(150)}
              className="flex-row items-center mb-5 gap-3 opacity-70"
            >
              <View className="flex-1 h-px bg-muted/20" />
              <Text className="text-muted font-serif-italic text-sm italic">
                Set down.
              </Text>
              <View className="flex-1 h-px bg-muted/20" />
            </Animated.View>
          )}

          {/* Timeline */}
          {entries.length > 0 ? (
            <View className="relative">
              {/* Final Thought cap */}
              {book.finalThought && (
                <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                  <View className="flex-row mb-6">
                    <View className="w-3 items-center">
                      <View
                        className="w-3 h-3 rounded-full mt-1 z-10"
                        style={{ backgroundColor: primary }}
                      />
                      <View
                        className="absolute w-0.5"
                        style={{
                          top: 16,
                          bottom: -28,
                          backgroundColor: primary,
                          opacity: 0.3,
                        }}
                      />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="text-primary text-xs font-medium">
                        Final Thought
                      </Text>
                      <View className="mt-1.5">
                        <RichTextPreview html={book.finalThought} />
                      </View>
                    </View>
                  </View>
                </Animated.View>
              )}
              {/* Exit Note node */}
              {book.exitNote && (
                <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                  <View className="flex-row mb-6">
                    <View className="w-3 items-center">
                      <View
                        className={`rounded-full mt-1 z-10 ${
                          book.status === "dnf"
                            ? "w-2 h-2 bg-muted/30 ml-0.5"
                            : "w-3 h-3 bg-muted/50"
                        }`}
                      />
                      {book.status !== "dnf" && (
                        <View
                          className="absolute w-0.5 bg-muted/20"
                          style={{ top: 16, bottom: -28 }}
                        />
                      )}
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="text-muted text-xs font-medium">
                        Exit Note
                      </Text>
                      <View className="mt-1.5">
                        <RichTextPreview html={book.exitNote} />
                      </View>
                    </View>
                  </View>
                </Animated.View>
              )}
              {entries.map((entry, index) => {
                const emotion = entry.feeling
                  ? getEmotionByLabel(entry.feeling)
                  : undefined;
                const nextEntry = entries[index + 1];
                const nextEmotion = nextEntry?.feeling
                  ? getEmotionByLabel(nextEntry.feeling)
                  : undefined;
                const isLast = index === entries.length - 1 && !book.firstImpression;
                const isUnfinishedAudio = !!entry.audioUri && !entry.snippet && !entry.feeling;
                const dotColor = emotion?.color ?? "#71717a";

                return (
                  <Animated.View
                    key={entry.id}
                    entering={FadeInDown.duration(400).delay(250 + index * 80)}
                  >
                    <View className="flex-row mb-6">
                      {/* Dot + Line segment */}
                      <View className="w-3 items-center">
                        {isUnfinishedAudio ? (
                          <RippleDot color={primary ?? dotColor} />
                        ) : (
                          <View
                            className="w-3 h-3 rounded-full mt-1 z-10"
                            style={{ backgroundColor: dotColor }}
                          />
                        )}
                        {!isLast && (
                          <View
                            className="absolute w-0.5"
                            style={{
                              top: 16,
                              bottom: -28,
                              backgroundColor: nextEmotion?.color ?? "#71717a",
                              opacity: 0.3,
                            }}
                          />
                        )}
                      </View>

                      {/* Content */}
                      <Pressable
                        onPress={() => handleEntryPress(entry.id)}
                        onLongPress={() => handleLongPress(entry.id)}
                        className="flex-1 ml-4"
                      >
                        <View className="flex-row items-center gap-2">
                          <Text className="text-muted/60 text-xs">
                            {timeAgo(entry.date)}
                          </Text>
                          {entry.chapter && (
                            <Text className="text-muted/40 text-xs">
                              · Ch. {entry.chapter}
                            </Text>
                          )}
                          {entry.audioUri && !entry.snippet && !entry.feeling && (
                            <View className="flex-row items-center gap-1 bg-primary/10 rounded-full px-1.5 py-0.5">
                              <MicrophoneIcon size={10} className="text-primary" />
                              <Text className="text-primary text-[10px] font-medium">
                                Voice Draft
                              </Text>
                            </View>
                          )}
                        </View>

                        {entry.snippet ? (
                          <Text
                            className="text-foreground font-serif text-sm italic mt-1.5 leading-relaxed"
                            numberOfLines={2}
                          >
                            "{stripHtml(entry.snippet)}"
                          </Text>
                        ) : null}

                        {entry.reflection ? (
                          <Text
                            className="text-muted text-sm mt-1 leading-relaxed"
                            numberOfLines={4}
                          >
                            {stripHtml(entry.reflection)}
                          </Text>
                        ) : null}

                        {entry.audioUri ? (
                          <View className="mt-2">
                            <AudioPlayer uri={entry.audioUri} />
                          </View>
                        ) : null}

                        {emotion && (
                          <Text className="text-muted/50 text-xs mt-1.5">
                            {emotion.emoji} {emotion.label}
                          </Text>
                        )}
                      </Pressable>
                    </View>
                  </Animated.View>
                );
              })}

              {/* First Impression anchor */}
              {book.firstImpression && (
                <Animated.View
                  entering={FadeInDown.duration(400).delay(250 + entries.length * 80)}
                >
                  <View className="flex-row">
                    <View className="w-3 items-center">
                      <View
                        className="w-3 h-3 rounded-full mt-1 z-10"
                        style={{ backgroundColor: primary }}
                      />
                    </View>
                    <View className="flex-1 ml-4">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-primary text-xs font-medium">
                          First Impression
                        </Text>
                        <Text className="text-muted/40 text-xs">
                          · {timeAgo(book.addedAt)}
                        </Text>
                      </View>
                      <View className="mt-1.5">
                        <RichTextPreview html={book.firstImpression} />
                      </View>
                    </View>
                  </View>
                </Animated.View>
              )}
            </View>
          ) : (
            <>
              {book.finalThought && (
                <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                  <View className="flex-row mb-6">
                    <View className="w-3 items-center">
                      <View
                        className="w-3 h-3 rounded-full mt-1 z-10"
                        style={{ backgroundColor: primary }}
                      />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="text-primary text-xs font-medium">
                        Final Thought
                      </Text>
                      <View className="mt-1.5">
                        <RichTextPreview html={book.finalThought} />
                      </View>
                    </View>
                  </View>
                </Animated.View>
              )}
              {book.exitNote && (
                <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                  <View className="flex-row mb-6">
                    <View className="w-3 items-center">
                      <View
                        className={`rounded-full mt-1 z-10 ${
                          book.status === "dnf"
                            ? "w-2 h-2 bg-muted/30 ml-0.5"
                            : "w-3 h-3 bg-muted/50"
                        }`}
                      />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="text-muted text-xs font-medium">
                        Exit Note
                      </Text>
                      <View className="mt-1.5">
                        <RichTextPreview html={book.exitNote} />
                      </View>
                    </View>
                  </View>
                </Animated.View>
              )}
              {!book.firstImpression && (
                <Animated.View
                  entering={FadeInDown.duration(400).delay(250)}
                  className="items-center py-12"
                >
                  <Text className="text-muted text-sm text-center leading-relaxed mb-4">
                    No reflections yet.
                  </Text>
                  <PillButton
                    icon="plus"
                    label="Add Reflection"
                    onPress={handleNewEntry}
                  />
                </Animated.View>
              )}
              {book.firstImpression && (
                <Animated.View entering={FadeInDown.duration(400).delay(350)}>
                  <View className="flex-row">
                    <View className="w-3 items-center">
                      <View
                        className="w-3 h-3 rounded-full mt-1 z-10"
                        style={{ backgroundColor: primary }}
                      />
                    </View>
                    <View className="flex-1 ml-4">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-primary text-xs font-medium">
                          First Impression
                        </Text>
                        <Text className="text-muted/40 text-xs">
                          · {timeAgo(book.addedAt)}
                        </Text>
                      </View>
                      <View className="mt-1.5">
                        <RichTextPreview html={book.firstImpression} />
                      </View>
                    </View>
                  </View>
                </Animated.View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default BookDetailScreen;
