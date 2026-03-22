import type { GoogleBook } from "@/services/google-books";
import { Button, Input } from "@bookfelt/ui";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Keyboard, Pressable, ScrollView, Text, View } from "react-native";
import { MicrophoneIcon, PencilIcon } from "react-native-heroicons/outline";
import Animated, { FadeInDown } from "react-native-reanimated";
import BookSearchInput from "@/features/books/components/BookSearchInput";
import BookSearchResults from "@/features/books/components/BookSearchResults";
import IsbnScannerOverlay from "@/features/books/components/IsbnScannerOverlay";
import { useIsbnLookup } from "@/features/books/queries/use-isbn-lookup";
import { useLibrary, useOnboardingStep } from "@/features/books/hooks/use-library";
import { useSearchBooks } from "@/features/books/queries/use-search-books";
import { setOnboardingStep } from "@/features/books/services/library.service";
import type { Book } from "@/features/books/types/book";
import AudioPlayer from "@/features/entries/components/AudioPlayer";
import VoiceIsland from "@/features/entries/components/VoiceIsland";
import {
  FocusModeOverlay,
  RichTextPreview,
  ScreenWrapper,
  TranscribingIndicator,
  useThemeColors,
} from "@/shared";
import { useTranscriptionStore } from "@/shared/stores/transcription.store";

export default function OnboardingScreen() {
  const step = useOnboardingStep();
  const { books } = useLibrary();
  const router = useRouter();

  // For step 2, grab the most recently added book
  const latestBook = books.length > 0
    ? books.reduce((a, b) => (a.addedAt > b.addedAt ? a : b))
    : null;

  useEffect(() => {
    if (step >= 3) {
      router.replace("/");
    }
  }, [step]);

  if (step >= 3) return null;

  return (
    <ScreenWrapper>
      {step === 0 && (
        <WelcomeStep onNext={() => setOnboardingStep(1)} />
      )}
      {step === 1 && (
        <AddBookStep
          onBookAdded={() => setOnboardingStep(2)}
        />
      )}
      {step === 2 && latestBook && (
        <FirstImpressionStep bookId={latestBook.id} />
      )}
    </ScreenWrapper>
  );
}

/* ─── Step 0: Welcome ─── */

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <View className="flex-1 justify-center items-center px-6">
      <Animated.View entering={FadeInDown.duration(500).delay(100)} className="items-center">
        <Image
          source={require("../../assets/images/icon.png")}
          className="w-24 h-24 rounded-2xl mb-6"
        />
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(500).delay(250)} className="items-center">
        <Text className="text-foreground font-serif text-3xl font-bold">Bookfelt</Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(500).delay(400)} className="items-center">
        <Text className="text-muted-foreground text-sm mt-3 font-serif-italic text-center">
          Capture your thoughts and feelings{"\n"}as you read.
        </Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(500).delay(550)} className="w-full mt-10">
        <Button onPress={onNext} shape="pill" className="w-full">
          <Text className="text-background text-center font-medium text-base">Get Started</Text>
        </Button>
      </Animated.View>
    </View>
  );
}

/* ─── Step 1: Add Your First Book ─── */

function AddBookStep({ onBookAdded }: { onBookAdded: () => void }) {
  const { addBook, isInLibrary } = useLibrary();
  const { primary } = useThemeColors();

  const [mode, setMode] = useState<"search" | "manual">("search");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { data: searchResults = [], isLoading, error } = useSearchBooks(debouncedQuery);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const isbnLookup = useIsbnLookup();

  const [manualTitle, setManualTitle] = useState("");
  const [manualAuthor, setManualAuthor] = useState("");

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  const handleIsbnScanned = (isbn: string) => {
    setIsScannerOpen(false);
    isbnLookup.mutate(isbn, {
      onSuccess: (book) => {
        if (book) {
          handleSelectBook(book);
        } else {
          Alert.alert("Book Not Found", `No book found for ISBN ${isbn}.`, [
            { text: "Try Again", onPress: () => setIsScannerOpen(true) },
            { text: "Add Manually", onPress: () => setMode("manual") },
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

  const handleSelectBook = async (googleBook: GoogleBook) => {
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
    const bookId = await addBook(book, "reading");
    if (bookId) onBookAdded();
  };

  const handleManualAdd = async () => {
    Keyboard.dismiss();
    const book: Book = {
      id: `manual-${Date.now()}`,
      title: manualTitle.trim(),
      authors: manualAuthor.trim() ? [manualAuthor.trim()] : ["Unknown author"],
      source: "manual",
    };
    const bookId = await addBook(book, "reading");
    if (bookId) onBookAdded();
  };

  return (
    <View className="flex-1">
      <Animated.View entering={FadeInDown.duration(400)} className="items-center py-4">
        <Text className="text-foreground font-serif text-xl font-semibold">
          Add Your First Book
        </Text>
        <Text className="text-muted text-sm mt-1">What are you currently reading?</Text>
      </Animated.View>

      {mode === "search" && (
        <>
          <Animated.View entering={FadeInDown.duration(500).delay(100)} className="mb-3">
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
                onManualCreate={() => setMode("manual")}
              />
            </View>
          ) : (
            <View className="flex-1 items-center justify-center pb-20">
              <Animated.View entering={FadeInDown.duration(400).delay(200)} className="items-center">
                <Text className="text-muted text-sm text-center leading-relaxed">
                  Search for the book you're reading
                </Text>
              </Animated.View>
              <Animated.View entering={FadeInDown.duration(400).delay(300)} className="items-center mt-4">
                <Pressable
                  onPress={() => setMode("manual")}
                  className="flex-row items-center gap-2 bg-primary/10 rounded-full px-4 py-2"
                >
                  <PencilIcon size={14} color={primary} />
                  <Text className="text-primary text-sm font-medium">Add manually</Text>
                </Pressable>
              </Animated.View>
            </View>
          )}
        </>
      )}

      {mode === "manual" && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-6"
          keyboardShouldPersistTaps="handled"
        >
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
              onPress={handleManualAdd}
              disabled={manualTitle.trim().length === 0}
              shape="pill"
              className="mt-2"
            >
              <Text className="text-background text-center font-medium">Add to Library</Text>
            </Button>

            <Pressable onPress={() => setMode("search")} className="items-center py-2">
              <Text className="text-muted text-sm">Back to search</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      )}

      {isbnLookup.isPending && (
        <View className="absolute inset-0 items-center justify-center bg-background/80">
          <ActivityIndicator size="large" color={primary} />
          <Text className="text-muted text-sm mt-3">Looking up scanned book...</Text>
        </View>
      )}

      {isScannerOpen && (
        <IsbnScannerOverlay
          onScanned={handleIsbnScanned}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </View>
  );
}

/* ─── Step 2: First Impression ─── */

function FirstImpressionStep({ bookId }: { bookId: string }) {
  const router = useRouter();
  const { books, updateBook } = useLibrary();
  const book = books.find((b) => b.id === bookId);
  const { mutedForeground } = useThemeColors();

  const [firstImpression, setFirstImpression] = useState("");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [audioUri, setAudioUri] = useState<string | undefined>();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const transcriptionStatus = useTranscriptionStore((s) => s.status);
  const transcriptionText = useTranscriptionStore((s) => s.text);
  const startTranscription = useTranscriptionStore((s) => s.startTranscription);
  const resetTranscription = useTranscriptionStore((s) => s.reset);

  useEffect(() => {
    if (transcriptionStatus === "completed" && transcriptionText) {
      setFirstImpression(transcriptionText);
    }
  }, [transcriptionStatus, transcriptionText]);

  useEffect(() => {
    return () => resetTranscription();
  }, []);

  const completeOnboarding = async () => {
    await setOnboardingStep(3);
    router.replace("/");
  };

  const handleSave = async () => {
    if (firstImpression.trim()) {
      updateBook(bookId, {
        firstImpression: firstImpression.trim(),
        firstImpressionAudioUri: audioUri,
      });
    }
    await completeOnboarding();
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  if (!book) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-muted text-sm">Book not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8 flex-grow justify-center"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center">
          <Animated.View entering={FadeInDown.duration(500).delay(100)} className="items-center">
            {book.coverUrl && (
              <Image
                source={{ uri: book.coverUrl }}
                className="w-20 h-28 rounded-xl"
                resizeMode="cover"
              />
            )}
            <Text className="text-foreground font-serif text-lg font-semibold mt-4 text-center px-8">
              {book.title}
            </Text>
            <Text className="text-muted text-sm mt-1">{book.authors.join(", ")}</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(500).delay(300)}
            className="my-6 w-16 h-px bg-primary/20"
          />

          <Animated.View
            entering={FadeInDown.duration(500).delay(500)}
            className="items-center mb-6"
          >
            <Text className="text-foreground font-serif-italic text-base italic">
              The journey begins.
            </Text>
            <Text className="text-muted text-sm mt-2 text-center px-6">
              What is your first impression of this story?
            </Text>
          </Animated.View>

          {/* Writing card */}
          <Animated.View entering={FadeInDown.duration(500).delay(700)} className="w-full">
            <Pressable
              onPress={() => setIsFocusMode(true)}
              className="border border-primary/30 rounded-2xl bg-card p-5 min-h-[120px]"
            >
              <Pressable
                onPress={() => setIsVoiceOpen(true)}
                hitSlop={8}
                className="absolute top-3 right-3 z-10 p-1"
              >
                <MicrophoneIcon size={18} color={mutedForeground} />
              </Pressable>
              {transcriptionStatus === "transcribing" ? (
                <TranscribingIndicator />
              ) : firstImpression ? (
                <RichTextPreview html={firstImpression} />
              ) : (
                <Text className="text-sm text-muted/60 italic">
                  Tap to write your first impression...
                </Text>
              )}
            </Pressable>
            {audioUri && (
              <View className="pt-2">
                <AudioPlayer uri={audioUri} />
              </View>
            )}
          </Animated.View>

          {/* Actions */}
          <Animated.View entering={FadeInDown.duration(500).delay(900)} className="w-full mt-8">
            <Button onPress={handleSave} shape="pill" className="w-full">
              <Text className="text-background text-center font-medium text-base">
                Begin the Journey
              </Text>
            </Button>
            <Pressable onPress={handleSkip} className="mt-4 items-center py-2">
              <Text className="text-muted text-sm">Skip for now</Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>

      {isFocusMode && (
        <FocusModeOverlay
          content={firstImpression}
          onChangeContent={setFirstImpression}
          onDone={() => setIsFocusMode(false)}
          placeholder="What do you expect from this book?"
        />
      )}

      {isVoiceOpen && (
        <VoiceIsland
          bookCoverUrl={book.coverUrl}
          bookTitle={book.title}
          bookAuthor={book.authors?.[0]}
          onSave={(uri) => {
            setAudioUri(uri);
            startTranscription(uri);
            setIsVoiceOpen(false);
          }}
          onClose={() => setIsVoiceOpen(false)}
        />
      )}
    </View>
  );
}
