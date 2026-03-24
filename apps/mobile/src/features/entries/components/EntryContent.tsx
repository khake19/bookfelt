import { Text, View } from "react-native";
import type { Emotion } from "@/features/entries/types/emotion";
import AudioPlayer from "./AudioPlayer";

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

interface EntryContentProps {
  snippet?: string;
  reflection?: string;
  reflectionUri?: string;
  emotion?: Emotion;
  setting?: string;
}

const EntryContent = ({
  snippet,
  reflection,
  reflectionUri,
  emotion,
  setting,
}: EntryContentProps) => {
  // Two-zone: snippet + reflection (text or audio)
  if (snippet && stripHtml(snippet) && ((reflection && stripHtml(reflection)) || reflectionUri)) {
    return (
      <View className="rounded-2xl overflow-hidden bg-card">
        {/* Top zone: Quote with emotion background */}
        <View
          className="px-4 py-3"
          style={{
            backgroundColor: emotion?.color
              ? `${emotion.color}dd`
              : "hsl(20, 50%, 45%)",
          }}
        >
          <Text className="text-white font-serif-italic text-sm leading-relaxed">
            <Text className="text-white/90 text-2xl leading-none">"</Text>
            {stripHtml(snippet)}
          </Text>
        </View>

        {/* Speech bubble arrow connector */}
        <View className="bg-card pl-4">
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: 8,
              borderRightWidth: 8,
              borderTopWidth: 8,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderTopColor: emotion?.color
                ? `${emotion.color}dd`
                : "hsl(20, 50%, 45%)",
            }}
          />
        </View>

        {/* Bottom zone: Reflection on neutral background */}
        <View className="px-4 py-3">
          {reflection && stripHtml(reflection) && (
            <Text className="text-foreground text-base leading-relaxed">
              {stripHtml(reflection)}
            </Text>
          )}
          {reflectionUri && (
            <View className={reflection && stripHtml(reflection) ? "mt-3" : ""}>
              <AudioPlayer uri={reflectionUri} />
            </View>
          )}
          {setting && (
            <Text className="text-muted/60 text-xs mt-3 font-serif-italic">
              {setting}
            </Text>
          )}
        </View>
      </View>
    );
  }

  // Quote-only card (snippet without reflection)
  if (snippet && stripHtml(snippet) && (!reflection || !stripHtml(reflection)) && !reflectionUri) {
    return (
      <View
        className="rounded-3xl p-6 min-h-[200px] justify-center"
        style={{
          backgroundColor: emotion?.color
            ? `${emotion.color}dd`
            : "hsl(20, 50%, 45%)",
        }}
      >
        <Text className="text-white font-serif-italic text-2xl leading-relaxed">
          <Text className="text-white/90 text-5xl leading-none">"</Text>
          {stripHtml(snippet)}
        </Text>
        {setting && (
          <Text className="text-white/60 text-xs mt-4 font-serif-italic">
            {setting}
          </Text>
        )}
      </View>
    );
  }

  // Reflection-only: minimal with subtle background tint
  if (!snippet && reflection && stripHtml(reflection)) {
    return (
      <View
        className="rounded-2xl px-4 py-3"
        style={{
          backgroundColor: emotion?.color
            ? `${emotion.color}12`
            : "rgba(113, 113, 122, 0.07)",
        }}
      >
        <Text className="text-foreground text-base leading-relaxed">
          {stripHtml(reflection)}
        </Text>
        {reflectionUri && (
          <View className="mt-3">
            <AudioPlayer uri={reflectionUri} />
          </View>
        )}
        {setting && (
          <Text className="text-muted/60 text-xs mt-3 font-serif-italic">
            {setting}
          </Text>
        )}
      </View>
    );
  }

  // Emotion-only: compact pill/badge
  if (emotion && !snippet && !reflection && !reflectionUri) {
    return (
      <View className="flex-row items-center flex-wrap gap-2">
        <View
          className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ backgroundColor: `${emotion.color}25` }}
        >
          <Text className="text-base">{emotion.emoji}</Text>
          <Text
            className="text-sm font-medium"
            style={{ color: emotion.color }}
          >
            {emotion.label}
          </Text>
        </View>
      </View>
    );
  }

  // Fallback: compact text for voice drafts/other
  return (
    <View className="gap-3 pl-13">
      {snippet && stripHtml(snippet) && (
        <Text
          className="text-sm text-foreground/70 font-serif-italic leading-relaxed"
          numberOfLines={3}
        >
          "{stripHtml(snippet)}"
        </Text>
      )}
      {reflection && stripHtml(reflection) && (
        <Text
          className="text-sm text-foreground leading-relaxed"
          numberOfLines={4}
        >
          {stripHtml(reflection)}
        </Text>
      )}
      {reflectionUri && <AudioPlayer uri={reflectionUri} />}
    </View>
  );
};

export default EntryContent;
