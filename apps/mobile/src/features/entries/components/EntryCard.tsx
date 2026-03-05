import {
  Badge,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@bookfelt/ui";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { getEmotionByLabel } from "../constants/emotions";

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

export interface EntryCardData {
  id: string;
  title: string;
  chapter: string;
  date: string;
  snippet?: string;
  reaction: string;
  feeling?: string;
}

interface EntryCardProps extends EntryCardData {
  onPress?: () => void;
  onLongPress?: () => void;
}

const EntryCard = (props: EntryCardProps) => {
  const { title, chapter, date, snippet, reaction, feeling, onPress, onLongPress } = props;

  const emotion = feeling ? getEmotionByLabel(feeling) : undefined;
  const color = emotion?.color;

  const badgeScale = useSharedValue(1);
  useEffect(() => {
    if (emotion) {
      badgeScale.value = withDelay(
        600,
        withSequence(
          withTiming(1.08, { duration: 250 }),
          withTiming(1, { duration: 200 })
        )
      );
    }
  }, []);
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
      <Card style={color ? { backgroundColor: color + "40" } : undefined}>
        <CardHeader>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <CardTitle className="font-mono">{title}</CardTitle>
              {chapter ? (
                <Text className="text-muted text-xs mt-0.5">{chapter}</Text>
              ) : null}
            </View>
            <Text className="text-muted text-xs">{date}</Text>
          </View>
        </CardHeader>
        <CardContent className="gap-3">
          {snippet ? (
            <View
              className="rounded-l pl-3"
              style={color ? { borderLeftWidth: 2, borderLeftColor: color + "60" } : { borderLeftWidth: 2, borderLeftColor: "rgba(0,0,0,0.1)" }}
            >
              <Text className="text-sm italic text-foreground/80 font-serif-italic leading-relaxed" numberOfLines={3}>
                {"\u201C"}
                {snippet}
                {"\u201D"}
              </Text>
            </View>
          ) : null}
          {reaction ? (
            <Text
              className="text-sm text-muted leading-relaxed"
              numberOfLines={2}
            >
              {stripHtml(reaction)}
            </Text>
          ) : null}
        </CardContent>
        {emotion && (
          <CardFooter>
            <Animated.View style={badgeStyle}>
              <Badge
                style={{ backgroundColor: color + "18" }}
                className="border-0"
              >
                <Text style={{ color }} className="text-xs font-medium">
                  {emotion.emoji} {emotion.label}
                </Text>
              </Badge>
            </Animated.View>
          </CardFooter>
        )}
      </Card>
    </Pressable>
  );
};

export default EntryCard;
