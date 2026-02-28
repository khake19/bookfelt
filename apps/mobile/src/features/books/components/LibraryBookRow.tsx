import Feather from "@expo/vector-icons/Feather";
import { Image, Pressable, Text, View } from "react-native";
import { LibraryBook } from "../types/book";

interface LibraryBookRowProps {
  book: LibraryBook;
  onSetReading: () => void;
}
const LibraryBookRow = (props: LibraryBookRowProps) => {
  const { book, onSetReading } = props;

  return (
    <View className="flex-row items-center gap-3 py-3 px-1">
      {book.coverUrl ? (
        <Image
          source={{ uri: book.coverUrl }}
          className="w-10 h-14 rounded bg-border"
          resizeMode="cover"
        />
      ) : (
        <View>
          <Feather name="book" size={16} className="text-muted" />
        </View>
      )}
      <View className="flex-1">
        <Text
          className="text-foreground font-serif text-sm font-semibold"
          numberOfLines={1}
        >
          {book.title}
        </Text>
        <Text className="text-muted text-xs" numberOfLines={1}>
          {book.authors.join(", ")}
        </Text>
      </View>
      {book.status !== "reading" && (
        <Pressable
          onPress={onSetReading}
          hitSlop={8}
          className="bg-primary/10 rounded-full
      px-2.5 py-1"
        >
          <Text className="text-primary text-xs font-medium">Read</Text>
        </Pressable>
      )}
      {book.status === "reading" &&
        book.currentChapter != null &&
        book.totalChapters != null && (
          <Text className="text-muted/60 text-xs">
            Ch.
            {book.currentChapter}/{book.totalChapters}
          </Text>
        )}
    </View>
  );
};

export default LibraryBookRow;
