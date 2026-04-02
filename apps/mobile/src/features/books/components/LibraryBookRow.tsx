import { Image, Pressable, Text, View } from "react-native";
import Animated, { FadeOut, LinearTransition } from "react-native-reanimated";
import { LibraryBook } from "@/features/books/types/book";

interface LibraryBookRowProps {
  book: LibraryBook;
  isPrimary?: boolean;
  onSetReading: () => void;
  onSetPrimary?: () => void;
  onRemove?: () => void;
  onPress?: () => void;
}

const LibraryBookRow = (props: LibraryBookRowProps) => {
  const { book, isPrimary, onSetReading, onSetPrimary, onPress } =
    props;

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
      <Animated.View
        exiting={FadeOut.duration(200)}
        layout={LinearTransition.duration(300)}
        className={`flex-row gap-4 p-3 rounded-2xl${
          pressed ? " bg-primary/10" : " bg-card"
        }${
          book.status === "paused" ? " opacity-80" : book.status === "dnf" ? " opacity-60" : ""
        }`}
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

          {book.status === "reading" && isPrimary && (
            <View className="flex-row items-center gap-1.5 mt-2">
              <View className="w-1.5 h-1.5 rounded-full bg-primary" />
              <Text className="text-primary text-[10px] font-medium uppercase tracking-widest">
                Primary read
              </Text>
            </View>
          )}

          {book.status === "reading" && !isPrimary && onSetPrimary && (
            <View className="flex-row items-center gap-2 mt-2">
              <Pressable
                onPress={onSetPrimary}
                hitSlop={8}
                className="bg-primary/10 rounded-full px-3 py-1"
              >
                <Text className="text-primary text-xs font-medium">
                  Set as Primary
                </Text>
              </Pressable>
            </View>
          )}

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

          {book.status === "paused" && (
            <View className="flex-row items-center gap-2 mt-2">
              <Pressable
                onPress={onSetReading}
                hitSlop={8}
                className="bg-primary/10 rounded-full px-3 py-1"
              >
                <Text className="text-primary text-xs font-medium">
                  Resume Reading
                </Text>
              </Pressable>
            </View>
          )}

          {book.status === "dnf" && (
            <View className="flex-row items-center gap-1.5 mt-2">
              <Text className="text-muted/60 text-[10px] font-medium uppercase tracking-widest">
                Shelved
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
      )}
    </Pressable>
  );
};

export default LibraryBookRow;
