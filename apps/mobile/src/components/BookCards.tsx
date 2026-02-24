import {
  Badge,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@bookfelt/ui";
import { Text, View } from "react-native";

interface BookCardsProps {
  title: string;
  emoji: string;
  chapter: string;
  date: string;
  snippet: string;
  reaction: string;
  tags: string[];
}

const BookCards = (props: BookCardsProps) => {
  const { title, emoji, chapter, date, snippet, reaction, tags } = props;

  return (
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
        <View className="border-muted-foreground border-l-2 pl-3">
          <Text className="text-foreground/70 text-sm italic">{snippet}</Text>
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
  );
};

export default BookCards;
