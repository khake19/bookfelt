import {
  Badge,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@bookfelt/ui";
import { Pressable, Text, View } from "react-native";

interface Entry {
  title: string;
  emoji: string;
  chapter: string;
  date: string;
  snippet: string;
  reaction: string;
  tags: string[];
}

interface EntryCardProps extends Entry {
  onPress?: () => void;
}

const EntryCard = (props: EntryCardProps) => {
  const { title, emoji, chapter, date, snippet, reaction, tags, onPress } =
    props;

  return (
    <Pressable onPress={onPress}>
      <Card>
        <CardHeader>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text>{emoji}</Text>
              <View>
                <CardTitle className="font-mono">{title}</CardTitle>
                <Text className="text-muted-foreground text-sm">{chapter}</Text>
              </View>
            </View>
            <Text className="text-muted-foreground text-sm">{date}</Text>
          </View>
        </CardHeader>
        <CardContent className="gap-2">
          <View className="border-l-2 border-foreground/20 rounded-l pl-3">
            <Text className="text-sm italic text-foreground/70 font-serif-italic leading-relaxed">
              {snippet}
            </Text>
          </View>
          <View>
            <Text>{reaction}</Text>
          </View>
        </CardContent>
        <CardFooter>
          <Badge>
            <Text className="text-secondary">{tags}</Text>
          </Badge>
        </CardFooter>
      </Card>
    </Pressable>
  );
};

export default EntryCard;
