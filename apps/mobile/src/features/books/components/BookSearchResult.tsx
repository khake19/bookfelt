import Feather from "@expo/vector-icons/Feather";
import { Image, Pressable, Text, View } from "react-native";
import type { Book } from "../types/book";

interface BookSearchResultProps {
  book: Book;
  isInLibrary: boolean;
  onPress: (book: Book) => void;
}

const BookSearchResult = (props: BookSearchResultProps) => {
  const { book, isInLibrary, onPress } = props;

  return (
    <Pressable
      onPress={() => onPress(book)}
      className="flex-row items-center gap-3 py-3 px-1"
    >
      {book.coverUrl ? (
        <Image
          source={{ uri: book.coverUrl }}
          className="w-10 h-14 rounded bg-border"
          resizeMode="cover"
        />
      ) : (
        <View className="w-10 h-14 rounded bg-card border border-border items-center justify-center">
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
        {book.publishedDate && (
          <Text className="text-muted/60 text-xs">
            {book.publishedDate.substring(0, 4)}
          </Text>
        )}
      </View>
      {isInLibrary ? (
        <View className="bg-primary/15 rounded-full px-2 py-1">
          <Text className="text-primary text-xs font-medium">Added</Text>
        </View>
      ) : (
        <Feather name="plus-circle" size={20} className="text-primary" />
      )}
    </Pressable>
  );
};

export default BookSearchResult;
