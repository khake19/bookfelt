import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import {
  EllipsisHorizontalIcon,
  MicrophoneIcon,
} from "react-native-heroicons/outline";
import { ShareIcon } from "react-native-heroicons/solid";
import LinearGradient from "react-native-linear-gradient";
import Animated, {
  FadeInDown,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLibrary } from "@/features/books/hooks/use-library";
import type { ReadingStatus } from "@/features/books/types/book";
import { useEmotionMap, useEntries, useShareEntry, ShareableEntryView } from "@/features/entries";
import AudioPlayer from "@/features/entries/components/AudioPlayer";
import EntryContent from "@/features/entries/components/EntryContent";
import {
  CloseButton,
  PillButton,
  RichTextPreview,
  ScreenWrapper,
  stripHtml,
  timeAgo,
  useThemeColors,
} from "@/shared";
import { SHEET_IDS } from "@/shared/constants/sheet-ids";

function RippleDot({ color, delay = 0 }: { color: string; delay?: number }) {
  const ripple1 = useSharedValue(0);
  const ripple2 = useSharedValue(0);
  const dotScale = useSharedValue(0);

  useEffect(() => {
    dotScale.value = withDelay(delay, withTiming(1, { duration: 400 }));
    ripple1.value = withDelay(
      delay + 500,
      withRepeat(withTiming(1, { duration: 2400 }), -1, false),
    );
    ripple2.value = withDelay(
      delay + 1300,
      withRepeat(withTiming(1, { duration: 2400 }), -1, false),
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: color,
    position: "absolute" as const,
    transform: [{ scale: dotScale.value }],
  }));

  const ring1Style = useAnimatedStyle(() => ({
    position: "absolute" as const,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: color,
    opacity: (1 - ripple1.value) * 0.6,
    transform: [{ scale: 1 + ripple1.value * 1.2 }],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    position: "absolute" as const,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: color,
    opacity: (1 - ripple2.value) * 0.6,
    transform: [{ scale: 1 + ripple2.value * 1.2 }],
  }));

  return (
    <View className="w-3 h-3 items-center justify-center mt-1 z-10">
      <Animated.View style={ring1Style} />
      <Animated.View style={ring2Style} />
      <Animated.View style={dotStyle} />
    </View>
  );
}

const BookDetailScreen = () => {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const router = useRouter();
  const { books, updateStatus, removeBook } = useLibrary();
  const { entries, removeEntry } = useEntries(bookId);
  const { primary, background, mutedForeground } = useThemeColors();
  const emotionMap = useEmotionMap();
  const insets = useSafeAreaInsets();
  const book = books.find((b) => b.id === bookId);
  const [showDraftsOnly, setShowDraftsOnly] = useState(false);

  const { share, isCapturing } = useShareEntry();
  const [sharingEntryId, setSharingEntryId] = useState<string | null>(null);
  const shareableRefs = useRef<Map<string, React.RefObject<View>>>(new Map());

  const voiceDraftCount = entries.filter(
    (e) => e.reflectionUri && !e.emotionId,
  ).length;

  const displayEntries = showDraftsOnly
    ? entries.filter((e) => e.reflectionUri && !e.snippet && !e.emotionId)
    : entries;

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
        onEdit: () =>
          router.push({ pathname: "/book-edit", params: { bookId } }),
        onDelete: () => {
          removeBook(bookId);
          router.back();
        },
        onChangeStatus: (status: ReadingStatus | "put-down") => {
          if (status === "put-down") {
            router.push({ pathname: "/exit-interview", params: { bookId } });
            return;
          }
          if (status === "finished") {
            router.push({ pathname: "/final-thought", params: { bookId } });
            return;
          }
          updateStatus(bookId, status);
        },
        currentStatus: book.status,
      },
    });
  };

  const getShareableRef = (entryId: string) => {
    if (!shareableRefs.current.has(entryId)) {
      shareableRefs.current.set(entryId, { current: null });
    }
    return shareableRefs.current.get(entryId)!;
  };

  const handleShareEntry = async (entryId: string, e: any) => {
    e.stopPropagation();
    if (!book) return;

    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    const stripHtmlLocal = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    const hasSnippet = entry.snippet && stripHtmlLocal(entry.snippet);
    if (!hasSnippet) return;

    setSharingEntryId(entryId);
    const entryTitle = `${book.title} - ${new Date(entry.date).toLocaleDateString()}`;
    const ref = getShareableRef(entryId);
    await share(ref, entryTitle, entry.id, book.id, book.title);
    setSharingEntryId(null);
  };

  if (!book) {
    return (
      <ScreenWrapper>
        <View
          className="flex-row items-center pb-3"
          style={{ paddingTop: insets.top }}
        >
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-6"
        stickyHeaderIndices={[1]}
      >
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
                    <CloseButton
                      onPress={() => router.back()}
                      variant="overlay"
                    />
                    <Pressable
                      onPress={handleBookOptions}
                      className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
                    >
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
                  <CloseButton
                    onPress={() => router.back()}
                    variant="overlay"
                  />
                  <Pressable
                    onPress={handleBookOptions}
                    className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
                  >
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
            <View className="flex-row items-center gap-2">
              <Text className="text-xs font-medium uppercase tracking-widest text-muted/70">
                Reflections ({entries.length})
              </Text>
              {voiceDraftCount > 0 && (
                <Pressable
                  onPress={() => setShowDraftsOnly((v) => !v)}
                  className={`flex-row items-center gap-1 rounded-full px-2 py-0.5 ${
                    showDraftsOnly ? "bg-primary" : "bg-primary/10"
                  }`}
                >
                  <MicrophoneIcon
                    size={10}
                    color={showDraftsOnly ? background : primary}
                  />
                  <Text
                    className={`text-xs font-medium ${
                      showDraftsOnly ? "text-background" : "text-primary"
                    }`}
                  >
                    {voiceDraftCount}
                  </Text>
                </Pressable>
              )}
            </View>
            <View className="flex-row items-center gap-2">
              {entries.some(e => e.emotionId) && (
                <Pressable
                  onPress={() => router.push({
                    pathname: "/emotional-arc",
                    params: { bookId: book.id, bookTitle: book.title }
                  })}
                  className="px-3 py-1.5 rounded-full border border-border bg-secondary"
                >
                  <Text className="text-xs font-medium text-foreground">Arc</Text>
                </Pressable>
              )}
              <PillButton icon="plus" label="New" onPress={handleNewEntry} />
            </View>
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
              <Text className="text-primary font-serif-italic text-sm">
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
              <Text className="text-muted font-serif-italic text-sm">
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
              <Text className="text-muted font-serif-italic text-sm">
                Set down.
              </Text>
              <View className="flex-1 h-px bg-muted/20" />
            </Animated.View>
          )}

          {/* Timeline */}
          {entries.length > 0 ? (
            <View className="relative">
              {/* AI Summary node */}
              {book.status === "finished" && book.summary && !showDraftsOnly && (
                <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                  <View className="flex-row mb-6">
                    <View className="w-3 items-center">
                      <View className="w-3 h-3 rounded-full mt-1 z-10 bg-primary/60" />
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
                      <Text className="text-primary/80 text-xs font-medium">
                        Journey Summary
                      </Text>
                      <Text className="text-muted text-sm mt-1.5 leading-relaxed">
                        {book.summary}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              )}
              {/* Final Thought cap */}
              {book.status === "finished" && book.finalThought && !showDraftsOnly && (
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
                      {book.finalThoughtAudioUri && (
                        <View className="mt-2">
                          <AudioPlayer uri={book.finalThoughtAudioUri} />
                        </View>
                      )}
                    </View>
                  </View>
                </Animated.View>
              )}
              {/* Exit Note node */}
              {(book.status === "dnf" || book.status === "paused") && book.exitNote && !showDraftsOnly && (
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
                      {book.exitNoteAudioUri && (
                        <View className="mt-2">
                          <AudioPlayer uri={book.exitNoteAudioUri} />
                        </View>
                      )}
                    </View>
                  </View>
                </Animated.View>
              )}
              {displayEntries.map((entry, index) => {
                const emotion = entry.emotionId
                  ? emotionMap.get(entry.emotionId)
                  : undefined;
                const nextEntry = displayEntries[index + 1];
                const nextEmotion = nextEntry?.emotionId
                  ? emotionMap.get(nextEntry.emotionId)
                  : undefined;
                const isLast =
                  index === displayEntries.length - 1 && !book.firstImpression;
                const isUnfinishedAudio =
                  !!entry.reflectionUri && !entry.snippet && !entry.emotionId;
                const dotColor = emotion?.color ?? "#71717a";

                return (
                  <Animated.View
                    key={entry.id}
                    entering={FadeInDown.duration(400).delay(250 + index * 80)}
                    layout={LinearTransition.duration(250)}
                  >
                    <View className="flex-row mb-6">
                      {/* Dot + Line segment */}
                      <View className="w-3 items-center">
                        {entry.reflectionUri ? (
                          <RippleDot
                            color={dotColor}
                            delay={250 + index * 80}
                          />
                        ) : (
                          <View
                            className="w-3 h-3 rounded-full mt-1 z-10"
                            style={{ backgroundColor: dotColor }}
                          />
                        )}
                        {!isLast && !showDraftsOnly && (
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
                      <View className="flex-1 ml-4">
                        <Pressable
                          onPress={() => handleEntryPress(entry.id)}
                          onLongPress={() => handleLongPress(entry.id)}
                        >
                          {/* Metadata row - always shown */}
                          <View className="flex-row items-center justify-between gap-2 mb-1.5">
                            <View className="flex-row items-center gap-2 flex-1">
                              {emotion && (
                                <Text className="text-xs">
                                  {emotion.emoji} {emotion.label}
                                </Text>
                              )}
                              {entry.chapter && (
                                <Text className="text-muted/40 text-xs">
                                  · Ch. {entry.chapter}
                                </Text>
                              )}
                              {entry.reflectionUri &&
                                !entry.snippet &&
                                !entry.emotionId && (
                                  <View className="flex-row items-center gap-1 bg-primary/10 rounded-full px-1.5 py-0.5">
                                    <MicrophoneIcon size={10} color={primary} />
                                    <Text className="text-primary text-[10px] font-medium">
                                      Voice Draft
                                    </Text>
                                  </View>
                                )}
                            </View>
                            <Text className="text-muted/60 text-xs">
                              {timeAgo(entry.date)}
                            </Text>
                          </View>

                          {/* Entry content - shared component with share button inside */}
                          <View className="relative">
                            {/* Share button - positioned inside card top right - only for snippet-only entries */}
                            {entry.snippet && entry.snippet.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() && !entry.reflection && !entry.reflectionUri && (
                              <Pressable
                                onPress={(e) => handleShareEntry(entry.id, e)}
                                hitSlop={8}
                                disabled={isCapturing && sharingEntryId === entry.id}
                                className="absolute top-2 right-2 z-10 w-8 h-8 items-center justify-center rounded-full"
                                style={{ backgroundColor: background }}
                              >
                                {isCapturing && sharingEntryId === entry.id ? (
                                  <ActivityIndicator size="small" color={mutedForeground} />
                                ) : (
                                  <ShareIcon size={16} color={mutedForeground} />
                                )}
                              </Pressable>
                            )}

                            <EntryContent
                              snippet={entry.snippet}
                              reflection={entry.reflection}
                              reflectionUri={entry.reflectionUri}
                              emotion={emotion}
                              setting={entry.setting}
                            />
                          </View>
                        </Pressable>

                        {/* Off-screen shareable entry view for capture - only for snippet-only entries */}
                        {entry.snippet && entry.snippet.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() && !entry.reflection && !entry.reflectionUri && (
                          <View style={{ position: 'absolute', left: -9999 }}>
                            <ShareableEntryView
                              ref={getShareableRef(entry.id)}
                              entry={entry}
                              book={{ title: book.title, author: book.authors.join(", ") }}
                              emotion={emotion}
                            />
                          </View>
                        )}
                      </View>
                    </View>
                  </Animated.View>
                );
              })}

              {/* First Impression anchor */}
              {book.firstImpression && !showDraftsOnly && (
                <Animated.View
                  entering={FadeInDown.duration(400).delay(
                    250 + entries.length * 80,
                  )}
                >
                  <View className="flex-row">
                    <View className="w-3 items-center">
                      <View
                        className="w-3 h-3 rounded-full mt-1 z-10"
                        style={{ backgroundColor: primary }}
                      />
                    </View>
                    <View className="flex-1 ml-4">
                      <View className="flex-row items-center gap-2 mb-1.5">
                        <Text className="text-primary text-xs font-medium">
                          First Impression
                        </Text>
                        <Text className="text-muted/40 text-xs">
                          · {timeAgo(book.addedAt)}
                        </Text>
                      </View>
                      <View className="bg-card rounded-2xl px-4 py-3">
                        <RichTextPreview html={book.firstImpression} fontSize={16} />
                        {book.firstImpressionAudioUri && (
                          <View className="mt-3">
                            <AudioPlayer uri={book.firstImpressionAudioUri} />
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </Animated.View>
              )}
            </View>
          ) : (
            <>
              {book.status === "finished" && book.summary && !showDraftsOnly && (
                <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                  <View className="flex-row mb-6">
                    <View className="w-3 items-center">
                      <View className="w-3 h-3 rounded-full mt-1 z-10 bg-primary/60" />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="text-primary/80 text-xs font-medium">
                        Journey Summary
                      </Text>
                      <Text className="text-muted text-sm mt-1.5 leading-relaxed">
                        {book.summary}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              )}
              {book.status === "finished" && book.finalThought && !showDraftsOnly && (
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
                      {book.finalThoughtAudioUri && (
                        <View className="mt-2">
                          <AudioPlayer uri={book.finalThoughtAudioUri} />
                        </View>
                      )}
                    </View>
                  </View>
                </Animated.View>
              )}
              {(book.status === "dnf" || book.status === "paused") && book.exitNote && !showDraftsOnly && (
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
                      {book.exitNoteAudioUri && (
                        <View className="mt-2">
                          <AudioPlayer uri={book.exitNoteAudioUri} />
                        </View>
                      )}
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
                      <View className="flex-row items-center gap-2 mb-1.5">
                        <Text className="text-primary text-xs font-medium">
                          First Impression
                        </Text>
                        <Text className="text-muted/40 text-xs">
                          · {timeAgo(book.addedAt)}
                        </Text>
                      </View>
                      <View className="bg-card rounded-2xl px-4 py-3">
                        <RichTextPreview html={book.firstImpression} fontSize={16} />
                        {book.firstImpressionAudioUri && (
                          <View className="mt-3">
                            <AudioPlayer uri={book.firstImpressionAudioUri} />
                          </View>
                        )}
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
