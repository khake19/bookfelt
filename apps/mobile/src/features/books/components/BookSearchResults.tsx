import { FlashList } from "@shopify/flash-list";
import { BookOpenIcon, PencilIcon } from "react-native-heroicons/outline";
import { useThemeColors } from "../../../shared";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import BookSearchResult from "./BookSearchResult";
import { Book } from "../types/book";
import LottieView from "lottie-react-native";

interface BookSearchResultsProps {
  results: Book[];
  isLoading: boolean;
  error: string | null;
  query: string;
  isInLibrary: (bookId: string) => boolean;
  onSelectBook: (book: any) => void;
  onManualCreate: () => void;
}

const BookSearchResults = (props: BookSearchResultsProps) => {
  const { results, query, isInLibrary, onSelectBook, onManualCreate } = props;
  const { primary } = useThemeColors();

  return (
    <FlashList
      data={results}
      keyExtractor={(item) => item.id}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
          <BookSearchResult
            book={item}
            isInLibrary={isInLibrary(item.id)}
            onPress={onSelectBook}
          />
        </Animated.View>
      )}
      ItemSeparatorComponent={() => <View className="h-px bg-border mx-1" />}
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-4"
      ListEmptyComponent={
      <Animated.View
        entering={FadeIn.duration(300)}
        className="flex-1 items-center justify-center pb-20"
      >
        <LottieView
          source={require("../../../assets/book.lottie")}
          autoPlay
          loop
          renderMode="SOFTWARE"
          style={{ width: 120, height: 120, backgroundColor: "transparent" }}
        />
        <Text className="text-muted text-sm mt-4 text-center leading-relaxed">
          No books found for "{query}".{"\n"}Try a different search.
        </Text>
        <Pressable
          onPress={onManualCreate}
          className="flex-row items-center gap-2 mt-4 bg-primary/10 rounded-full px-4 py-2"
        >
          <PencilIcon size={14} color={primary} />
          <Text className="text-primary text-sm font-medium">
            Add it manually
          </Text>
        </Pressable>
      </Animated.View>
      }
    />
  );
};

export default BookSearchResults;
