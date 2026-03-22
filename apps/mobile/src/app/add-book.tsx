import type { GoogleBook } from "@/services/google-books";
import { Button, Input } from "@bookfelt/ui";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { PencilIcon } from "react-native-heroicons/outline";
import Animated, { FadeInDown } from "react-native-reanimated";
import BookSearchInput from "@/features/books/components/BookSearchInput";
import BookSearchResults from "@/features/books/components/BookSearchResults";
import IsbnScannerOverlay from "@/features/books/components/IsbnScannerOverlay";
import { useLibrary } from "@/features/books/hooks/use-library";
import { useIsbnLookup } from "@/features/books/queries/use-isbn-lookup";
import { useSearchBooks } from "@/features/books/queries/use-search-books";
import type { Book, ReadingStatus } from "@/features/books/types/book";
import { CloseButton, ScreenWrapper, useThemeColors } from "@/shared";

type ScreenMode =
  | { kind: "search" }
  | { kind: "manual" }
  | { kind: "confirm"; book: Book };

const STATUS_OPTIONS: { value: ReadingStatus; label: string }[] = [
  { value: "want-to-read", label: "Want to Read" },
  { value: "reading", label: "Reading" },
];

export default function AddBookScreen() {
  const router = useRouter();
  const { primary } = useThemeColors();
  const { addBook, isInLibrary } = useLibrary();

  const [mode, setMode] = useState<ScreenMode>({ kind: "search" });
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const isbnLookup = useIsbnLookup();

  // Search state
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const {
    data: searchResults = [],
    isLoading,
    error,
  } = useSearchBooks(debouncedQuery);

  // Manual entry state
  const [manualTitle, setManualTitle] = useState("");
  const [manualAuthor, setManualAuthor] = useState("");

  // Confirm state
  const [selectedStatus, setSelectedStatus] =
    useState<ReadingStatus>("want-to-read");

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  const goBackToSearch = () => {
    setMode({ kind: "search" });
    setSelectedStatus("want-to-read");
  };

  const handleIsbnScanned = (isbn: string) => {
    setIsScannerOpen(false);
    isbnLookup.mutate(isbn, {
      onSuccess: (book) => {
        if (book) {
          handleSelectBook(book);
        } else {
          Alert.alert("Book Not Found", `No book found for ISBN ${isbn}.`, [
            { text: "Try Again", onPress: () => setIsScannerOpen(true) },
            {
              text: "Add Manually",
              onPress: () => setMode({ kind: "manual" }),
            },
          ]);
        }
      },
      onError: () => {
        Alert.alert(
          "Lookup Failed",
          "Something went wrong while looking up the book. Please try again.",
          [
            { text: "Try Again", onPress: () => setIsScannerOpen(true) },
            { text: "Cancel" },
          ],
        );
      },
    });
  };

  const handleSelectBook = (googleBook: GoogleBook) => {
    Keyboard.dismiss();
    const book: Book = {
      id: googleBook.id,
      title: googleBook.title,
      authors: googleBook.authors,
      description: googleBook.description,
      pageCount: googleBook.pageCount,
      coverUrl: googleBook.coverUrl,
      isbn: googleBook.isbn,
      publisher: googleBook.publisher,
      publishedDate: googleBook.publishedDate,
      source: "google",
    };
    setMode({ kind: "confirm", book });
  };

  const handleManualAdd = async () => {
    Keyboard.dismiss();
    const book: Book = {
      id: `manual-${Date.now()}`,
      title: manualTitle.trim(),
      authors: manualAuthor.trim() ? [manualAuthor.trim()] : ["Unknown author"],
      source: "manual",
    };
    const bookId = await addBook(book, selectedStatus);
    if (!bookId) return;
    router.replace({
      pathname: "/first-impression",
      params: { bookId },
    });
  };

  const handleAdd = async (book: Book) => {
    const bookId = await addBook(book, selectedStatus);
    if (!bookId) return;
    router.replace({
      pathname: "/first-impression",
      params: { bookId },
    });
  };

  const alreadyAdded = mode.kind === "confirm" && isInLibrary(mode.book.id);

  return (
    <ScreenWrapper>
      <View className="flex-row items-center pb-3">
        <CloseButton
          onPress={() => {
            if (mode.kind === "confirm" || mode.kind === "manual") {
              goBackToSearch();
            } else {
              router.back();
            }
          }}
        />
        <View className="flex-1 items-center">
          <Text
            className="text-foreground font-serif font-semibold"
            numberOfLines={1}
          >
            {mode.kind === "confirm" ? "Add to Library" : "Add Book"}
          </Text>
        </View>
        <View className="w-[30px]" />
      </View>

      {mode.kind === "search" && (
        <>
          <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            className="mb-3"
          >
            <BookSearchInput
              value={query}
              onChangeText={setQuery}
              onClear={() => setQuery("")}
              onScanPress={() => setIsScannerOpen(true)}
            />
          </Animated.View>
          {debouncedQuery.trim().length > 0 ? (
            <View className="flex-1">
              <BookSearchResults
                results={searchResults}
                isLoading={isLoading}
                error={error ? error.message : null}
                query={debouncedQuery}
                isInLibrary={isInLibrary}
                onSelectBook={handleSelectBook}
                onManualCreate={() => setMode({ kind: "manual" })}
              />
            </View>
          ) : (
            <View className="flex-1 items-center justify-center pb-20">
              <Animated.View
                entering={FadeInDown.duration(400).delay(100)}
                className="items-center"
              >
                <LottieView
                  source={require("../assets/book.lottie")}
                  autoPlay
                  loop
                  renderMode="SOFTWARE"
                  style={{
                    width: 120,
                    height: 120,
                    backgroundColor: "transparent",
                  }}
                />
              </Animated.View>
              <Animated.View
                entering={FadeInDown.duration(400).delay(200)}
                className="items-center mt-4"
              >
                <Text className="text-muted text-sm text-center leading-relaxed">
                  What are you reading next?
                </Text>
              </Animated.View>
              <Animated.View
                entering={FadeInDown.duration(400).delay(300)}
                className="items-center mt-4"
              >
                <Pressable
                  onPress={() => setMode({ kind: "manual" })}
                  className="flex-row items-center gap-2 bg-primary/10 rounded-full px-4 py-2"
                >
                  <PencilIcon size={14} color={primary} />
                  <Text className="text-primary text-sm font-medium">
                    Add manually
                  </Text>
                </Pressable>
              </Animated.View>
            </View>
          )}
        </>
      )}

      {mode.kind === "manual" && (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-6"
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              entering={FadeInDown.duration(300)}
              className="gap-5 mt-4"
            >
              <View>
                <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-1.5">
                  Title
                </Text>
                <Input
                  value={manualTitle}
                  onChangeText={setManualTitle}
                  placeholder="Book title"
                  autoFocus
                  className="bg-card border-border"
                />
              </View>
              <View>
                <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-1.5">
                  Author
                </Text>
                <Input
                  value={manualAuthor}
                  onChangeText={setManualAuthor}
                  placeholder="Author name (optional)"
                  className="bg-card border-border"
                />
              </View>

              <View className="h-px bg-border" />

              <View>
                <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-3">
                  Reading Status
                </Text>
                <View className="flex-row gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      onPress={() => setSelectedStatus(opt.value)}
                      className={`flex-1 rounded-xl py-3 items-center border-[1.5px] ${
                        selectedStatus === opt.value
                          ? "bg-primary/10 border-primary"
                          : "bg-card border-border"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          selectedStatus === opt.value
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Button
                onPress={handleManualAdd}
                disabled={manualTitle.trim().length === 0}
                shape="pill"
                className="mt-2"
              >
                <Text className="text-background text-center font-medium">
                  Add to Library
                </Text>
              </Button>
            </Animated.View>
          </ScrollView>
        </>
      )}

      {mode.kind === "confirm" && (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-6"
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              entering={FadeInDown.duration(400)}
              className="items-center py-6"
            >
              {mode.book.coverUrl && (
                <Image
                  source={{ uri: mode.book.coverUrl }}
                  className="w-24 h-36 rounded-xl"
                  resizeMode="cover"
                />
              )}
              <Text className="text-foreground font-serif text-lg font-semibold mt-4 text-center px-8">
                {mode.book.title}
              </Text>
              <Text className="text-muted text-sm mt-1">
                {mode.book.authors.join(", ")}
              </Text>
            </Animated.View>

            <View className="h-px bg-border" />

            <Animated.View
              entering={FadeInDown.duration(400).delay(100)}
              className="py-4"
            >
              <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-3">
                Reading Status
              </Text>
              <View className="flex-row gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setSelectedStatus(opt.value)}
                    className={`flex-1 rounded-xl py-3 items-center border-[1.5px] ${
                      selectedStatus === opt.value
                        ? "bg-primary/10 border-primary"
                        : "bg-card border-border"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selectedStatus === opt.value
                          ? "text-primary"
                          : "text-foreground"
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.duration(400).delay(200)}
              className="pt-2"
            >
              <Button
                onPress={() => handleAdd(mode.book)}
                shape="pill"
                className="w-full"
                disabled={alreadyAdded}
              >
                <Text className="text-background text-center font-medium text-base">
                  {alreadyAdded ? "Already in Library" : "Add to Library"}
                </Text>
              </Button>
            </Animated.View>
          </ScrollView>
        </>
      )}
      {isbnLookup.isPending && (
        <View className="absolute inset-0 items-center justify-center bg-background/80">
          <ActivityIndicator size="large" color={primary} />
          <Text className="text-muted text-sm mt-3">
            Looking up scanned book...
          </Text>
        </View>
      )}

      {isScannerOpen && (
        <IsbnScannerOverlay
          onScanned={handleIsbnScanned}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </ScreenWrapper>
  );
}
