import { Image, Pressable, Text, View, ActivityIndicator } from "react-native";
import { useRef } from "react";
import { ShareIcon } from "react-native-heroicons/solid";
import { useEmotionMap } from "@/features/entries/hooks/use-emotions";
import { useShareEntry } from "@/features/entries/hooks/use-share-entry";
import { ShareableEntryView } from "@/features/entries/components/ShareableEntryView";
import { useThemeColors } from "@/shared";
import EntryContent from "./EntryContent";

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

export interface EntryCardData {
  id: string;
  bookId: string;
  title: string;
  author?: string;
  chapter: string;
  page?: string;
  percent?: string;
  date: string;
  dateTimestamp: number;
  snippet?: string;
  reaction: string;
  emotionId?: string;
  setting?: string;
  reflectionUri?: string;
  bookCoverUrl?: string;
}

interface EntryCardProps extends EntryCardData {
  onPress?: () => void;
  onLongPress?: () => void;
  onBookPress?: () => void;
}

const EntryCard = (props: EntryCardProps) => {
  const {
    id,
    bookId,
    title,
    author,
    chapter,
    page,
    percent,
    date,
    dateTimestamp,
    snippet,
    reaction,
    emotionId,
    setting,
    reflectionUri,
    bookCoverUrl,
    onPress,
    onLongPress,
    onBookPress,
  } = props;

  const { primary, mutedForeground, background } = useThemeColors();
  const emotionMap = useEmotionMap();
  const emotion = emotionId ? emotionMap.get(emotionId) : undefined;
  const { share, isCapturing } = useShareEntry();
  const shareableRef = useRef<View>(null);

  // Show share button only for snippet-only entries (no reflection)
  const hasSnippet = snippet && stripHtml(snippet);
  const hasReflection = reaction && stripHtml(reaction);
  const showShareButton = hasSnippet && !hasReflection && !reflectionUri;

  const handleShare = async (e: any) => {
    e.stopPropagation();
    if (!showShareButton) return;

    const entryTitle = `${title} - ${new Date(dateTimestamp).toLocaleDateString()}`;
    await share(shareableRef, entryTitle, id, bookId, title);
  };

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
      <View className="py-3">
        {/* Header: Book cover + title + metadata */}
        <View className="flex-row gap-3 mb-3">
          {/* Book cover avatar - clickable to book details */}
          <Pressable
            onPress={(e) => {
              if (onBookPress) {
                e.stopPropagation();
                onBookPress();
              }
            }}
            className="w-10 h-10 rounded-full overflow-hidden bg-secondary"
          >
            {bookCoverUrl && (
              <Image
                source={{ uri: bookCoverUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            )}
          </Pressable>

          {/* Book title + metadata */}
          <View className="flex-1">
            <Pressable
              onPress={(e) => {
                if (onBookPress) {
                  e.stopPropagation();
                  onBookPress();
                }
              }}
            >
              <View className="flex-row items-center gap-2 flex-wrap">
                <Text
                  className="font-semibold text-foreground text-sm"
                  numberOfLines={1}
                >
                  {title}
                </Text>
                {emotion && (
                  <View className="flex-row items-center gap-1">
                    <Text className="text-xs">{emotion.emoji}</Text>
                    <Text
                      className="text-xs text-muted"
                      style={{ color: emotion.color }}
                    >
                      {emotion.label}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <Text className="text-muted/60 text-xs">{date}</Text>
              {chapter && (
                <>
                  <Text className="text-muted/40 text-xs">·</Text>
                  <Text className="text-muted/60 text-xs">{chapter}</Text>
                </>
              )}
              {setting && (
                <>
                  <Text className="text-muted/40 text-xs">·</Text>
                  <Text className="text-muted/60 text-xs italic">
                    {setting}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Content - shared component with share button inside */}
        <View className="relative">
          {/* Share button - positioned inside card top right */}
          {showShareButton && (
            <Pressable
              onPress={handleShare}
              hitSlop={8}
              disabled={isCapturing}
              className="absolute top-2 right-2 z-10 w-8 h-8 items-center justify-center rounded-full"
              style={{ backgroundColor: background }}
            >
              {isCapturing ? (
                <ActivityIndicator size="small" color={mutedForeground} />
              ) : (
                <ShareIcon size={16} color={mutedForeground} />
              )}
            </Pressable>
          )}

          <EntryContent
            snippet={snippet}
            reflection={reaction}
            reflectionUri={reflectionUri}
            emotion={emotion}
            setting={setting}
          />
        </View>

        {/* Bottom divider */}
        <View className="h-px bg-border/50 mt-4" />

        {/* Off-screen shareable entry view for capture */}
        {showShareButton && (
          <View style={{ position: 'absolute', left: -9999 }}>
            <ShareableEntryView
              ref={shareableRef}
              entry={{
                id,
                bookId,
                bookTitle: title,
                chapter,
                page,
                percent,
                date: dateTimestamp,
                snippet,
                reflection: reaction,
                reflectionUri,
                setting,
                emotionId,
                createdAt: dateTimestamp,
              }}
              book={{ title, author }}
              emotion={emotion}
            />
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default EntryCard;
