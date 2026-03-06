import { useEffect, useRef, useState } from "react";
import { Button, Input } from "@bookfelt/ui";
import { useRouter } from "expo-router";
import { Image, Keyboard, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BookOpenIcon } from "react-native-heroicons/outline";
import type { GoogleBook } from "@bookfelt/core";
import BookSearchInput from "../features/books/components/BookSearchInput";
import BookSearchResults from "../features/books/components/BookSearchResults";
import { useSearchBooks } from "../features/books/queries/use-search-books";
import { useLibrary } from "../features/books/hooks/use-library";
import type { Book, ReadingStatus } from "../features/books/types/book";
import { CloseButton, ScreenWrapper, useThemeColors } from "../shared";

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
  const insets = useSafeAreaInsets();
  const { muted } = useThemeColors();
  const { addBook, updateBook, isInLibrary } = useLibrary();

  const [mode, setMode] = useState<ScreenMode>({ kind: "search" });

  // Search state
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { data: searchResults = [], isLoading, error } = useSearchBooks(debouncedQuery);

  // Manual entry state
  const [manualTitle, setManualTitle] = useState("");
  const [manualAuthor, setManualAuthor] = useState("");

  // Confirm state
  const [selectedStatus, setSelectedStatus] = useState<ReadingStatus>("want-to-read");
  const [firstImpression, setFirstImpression] = useState("");

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  const goBackToSearch = () => {
    setMode({ kind: "search" });
    setFirstImpression("");
    setSelectedStatus("want-to-read");
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

  const handleManualNext = () => {
    Keyboard.dismiss();
    const book: Book = {
      id: `manual-${Date.now()}`,
      title: manualTitle.trim(),
      authors: manualAuthor.trim() ? [manualAuthor.trim()] : ["Unknown author"],
      source: "manual",
    };
    setMode({ kind: "confirm", book });
  };

  const handleAdd = (book: Book) => {
    addBook(book, selectedStatus);
    if (firstImpression.trim()) {
      updateBook(book.id, { firstImpression: firstImpression.trim() });
    }
    router.back();
  };

  const alreadyAdded = mode.kind === "confirm" && isInLibrary(mode.book.id);

  return (
    <ScreenWrapper>
      <View className="flex-row items-center pb-3" style={{ paddingTop: insets.top }}>
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
          <Text className="text-foreground font-serif font-semibold" numberOfLines={1}>
            {mode.kind === "confirm" ? "Add to Library" : "Add Book"}
          </Text>
        </View>
        <View className="w-[30px]" />
      </View>

      {mode.kind === "search" && (
        <>
          <Animated.View entering={FadeInDown.duration(500).delay(100)} className="mb-3">
            <BookSearchInput
              value={query}
              onChangeText={setQuery}
              onClear={() => setQuery("")}
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
            <Animated.View
              entering={FadeIn.duration(300)}
              className="flex-1 items-center justify-center pb-20"
            >
              <Text className="text-muted text-sm text-center leading-relaxed">
                Search for a book by title or author.
              </Text>
            </Animated.View>
          )}
        </>
      )}

      {mode.kind === "manual" && (
        <Animated.View entering={FadeInDown.duration(300)} className="gap-5 mt-4">
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
          <Button
            onPress={handleManualNext}
            disabled={manualTitle.trim().length === 0}
            shape="pill"
            className="mt-2"
          >
            <Text className="text-background text-center font-medium">Next</Text>
          </Button>
        </Animated.View>
      )}

      {mode.kind === "confirm" && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-6"
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.duration(400)} className="items-center py-6">
            {mode.book.coverUrl ? (
              <Image
                source={{ uri: mode.book.coverUrl }}
                className="w-24 h-36 rounded-xl"
                resizeMode="cover"
              />
            ) : (
              <View className="w-24 h-36 rounded-xl bg-card border border-border items-center justify-center">
                <BookOpenIcon size={32} color={muted} />
              </View>
            )}
            <Text className="text-foreground font-serif text-lg font-semibold mt-4 text-center px-8">
              {mode.book.title}
            </Text>
            <Text className="text-muted text-sm mt-1">
              {mode.book.authors.join(", ")}
            </Text>
          </Animated.View>

          <View className="h-px bg-border" />

          <Animated.View entering={FadeInDown.duration(400).delay(100)} className="py-4">
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
                      selectedStatus === opt.value ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          <View className="h-px bg-border" />

          <Animated.View entering={FadeInDown.duration(400).delay(200)} className="py-4">
            <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-1.5">
              First Impression (optional)
            </Text>
            <TextInput
              className="text-sm text-foreground leading-relaxed min-h-[80px] bg-card border-[1.5px] border-border rounded-lg px-3 py-2.5"
              placeholderTextColor="rgba(128,128,128,0.5)"
              value={firstImpression}
              onChangeText={setFirstImpression}
              placeholder="What do you expect from this book?"
              multiline
              textAlignVertical="top"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(300)} className="pt-2">
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
      )}
    </ScreenWrapper>
  );
}
