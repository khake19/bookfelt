import { Image, Pressable, Text, View } from "react-native";
import Animated, { FadeOut, LinearTransition } from "react-native-reanimated";
import { BookOpenIcon, XMarkIcon } from "react-native-heroicons/outline";
import { useThemeColors } from "../../../shared";
import { LibraryBook } from "../types/book";

interface LibraryBookRowProps {
  book: LibraryBook;
  onSetReading: () => void;
  onRemove?: () => void;
}
const LibraryBookRow = (props: LibraryBookRowProps) => {
  const { book, onSetReading, onRemove } = props;
  const { muted } = useThemeColors();

  return (
    <Animated.View
      exiting={FadeOut.duration(200)}
      layout={LinearTransition.duration(300)}
      className="flex-row items-center gap-3 py-3 px-1"
    >
      {book.coverUrl ? (
        <Image
          source={{ uri: book.coverUrl }}
          className="w-10 h-14 rounded bg-border"
          resizeMode="cover"
        />
      ) : (
        <View>
          <BookOpenIcon size={16} color={muted} />
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
      {book.status === "want-to-read" && (
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={onSetReading}
            hitSlop={8}
            className="bg-primary/10 rounded-full px-2.5 py-1"
          >
            <Text className="text-primary text-xs font-medium">Read</Text>
          </Pressable>
          {onRemove && (
            <Pressable onPress={onRemove} hitSlop={8}>
              <XMarkIcon size={16} color={muted} />
            </Pressable>
          )}
        </View>
      )}
    </Animated.View>
  );
};

export default LibraryBookRow;
