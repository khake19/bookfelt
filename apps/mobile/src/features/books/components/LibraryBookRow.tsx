import { Image, Pressable, Text, View } from "react-native";
import Animated, { FadeOut, LinearTransition } from "react-native-reanimated";
import { LibraryBook } from "../types/book";

interface LibraryBookRowProps {
  book: LibraryBook;
  onSetReading: () => void;
  onRemove?: () => void;
  onPress?: () => void;
}

const LibraryBookRow = (props: LibraryBookRowProps) => {
  const { book, onSetReading, onRemove, onPress } = props;

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        exiting={FadeOut.duration(200)}
        layout={LinearTransition.duration(300)}
        className="flex-row gap-4 p-3 bg-card rounded-2xl"
      >
        {book.coverUrl && (
          <Image
            source={{ uri: book.coverUrl }}
            className="w-16 h-24 rounded-xl bg-border"
            resizeMode="cover"
          />
        )}

        <View className="flex-1 justify-center">
          <Text
            className="text-foreground font-serif text-base font-semibold leading-snug"
            numberOfLines={2}
          >
            {book.title}
          </Text>
          <Text className="text-muted text-xs mt-0.5" numberOfLines={1}>
            {book.authors.join(", ")}
          </Text>

          {book.description ? (
            <Text
              className="text-muted/60 text-xs mt-1.5 leading-relaxed"
              numberOfLines={2}
            >
              {book.description}
            </Text>
          ) : null}

          {book.status === "want-to-read" && (
            <View className="flex-row items-center gap-2 mt-2">
              <Pressable
                onPress={onSetReading}
                hitSlop={8}
                className="bg-primary/10 rounded-full px-3 py-1"
              >
                <Text className="text-primary text-xs font-medium">
                  Start Reading
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default LibraryBookRow;
