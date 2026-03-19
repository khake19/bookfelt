import { Image, Pressable, Text, View } from "react-native";
import { useEmotionMap } from "../hooks/use-emotions";
import AudioPlayer from "./AudioPlayer";

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

export interface EntryCardData {
  id: string;
  title: string;
  chapter: string;
  date: string;
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
}

const EntryCard = (props: EntryCardProps) => {
  const {
    title,
    chapter,
    date,
    snippet,
    reaction,
    emotionId,
    setting,
    reflectionUri,
    bookCoverUrl,
    onPress,
    onLongPress,
  } = props;

  const emotionMap = useEmotionMap();
  const emotion = emotionId ? emotionMap.get(emotionId) : undefined;

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
      <View className="py-3">
        {/* Header: Book cover + title + metadata */}
        <View className="flex-row gap-3 mb-3">
          {/* Book cover avatar */}
          <View className="w-10 h-10 rounded-full overflow-hidden bg-secondary">
            {bookCoverUrl && (
              <Image
                source={{ uri: bookCoverUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            )}
          </View>

          {/* Book title + metadata */}
          <View className="flex-1">
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

        {/* Content */}
        <View className="gap-3">
          {snippet && stripHtml(snippet) ? (
            <Text
              className="text-sm text-foreground/70 font-serif-italic leading-relaxed pl-13"
              numberOfLines={3}
            >
              "{stripHtml(snippet)}"
            </Text>
          ) : null}
          {reaction && stripHtml(reaction) ? (
            <Text
              className="text-sm text-foreground leading-relaxed pl-13"
              numberOfLines={4}
            >
              {stripHtml(reaction)}
            </Text>
          ) : null}
          {reflectionUri ? (
            <View className="pl-13">
              <AudioPlayer uri={reflectionUri} />
            </View>
          ) : null}
        </View>

        {/* Bottom divider */}
        <View className="h-px bg-border/50 mt-4" />
      </View>
    </Pressable>
  );
};

export default EntryCard;
