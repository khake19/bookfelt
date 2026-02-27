import {
  Badge,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@bookfelt/ui";
import { Pressable, Text, View } from "react-native";
import { getEmotionByLabel } from "../constants/emotions";

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
}

const EntryCard = (props: EntryCardProps) => {
  const { title, chapter, date, snippet, reaction, feeling, onPress } = props;

  const emotion = feeling ? getEmotionByLabel(feeling) : undefined;
  const color = emotion?.color;

  return (
    <Pressable onPress={onPress}>
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
          <Text
            className="text-sm text-muted leading-relaxed"
            numberOfLines={2}
          >
            {reaction}
          </Text>
        </CardContent>
        {emotion && (
          <CardFooter>
            <Badge
              style={{ backgroundColor: color + "25" }}
              className="border-0"
            >
              <Text style={{ color }} className="text-xs font-medium">
                {emotion.emoji} {emotion.label}
              </Text>
            </Badge>
          </CardFooter>
        )}
      </Card>
    </Pressable>
  );
};

export default EntryCard;
