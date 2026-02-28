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
  snippet: string;
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
      <Card
        style={color ? { borderLeftWidth: 3, borderLeftColor: color } : undefined}
      >
        <CardHeader>
          <View className="flex-row items-center justify-between">
            <View className="flex-row flex-1 items-center gap-2">
              {color && (
                <View
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
              )}
              <View className="flex-1">
                <CardTitle className="font-mono">{title}</CardTitle>
                <Text className="text-muted-foreground text-sm">{chapter}</Text>
              </View>
            </View>
            <Text className="text-muted/60 text-xs">{date}</Text>
          </View>
        </CardHeader>
        <CardContent className="gap-2">
          <View className="border-l-2 border-foreground/20 rounded-l pl-3">
            <Text className="text-sm italic text-foreground/70 font-serif-italic leading-relaxed">
              {"\u201C"}
              {snippet}
              {"\u201D"}
            </Text>
          </View>
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
                style={{ backgroundColor: color + "25" }}
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
