import type { GoogleBook } from "@/services/google-books";
import { Button, Input } from "@bookfelt/ui";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Keyboard, Pressable, ScrollView, Text, View } from "react-native";
import { MagnifyingGlassIcon, MicrophoneIcon, PencilIcon, ViewfinderCircleIcon } from "react-native-heroicons/outline";
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
import { getAnalytics } from "@/services/posthog";
import { AnalyticsEvents } from "@bookfelt/core";

export default function OnboardingScreen() {
  const step = useOnboardingStep();
  const { books } = useLibrary();
  const router = useRouter();

  // For step 2, grab the most recently added book
  const latestBook = books.length > 0
    ? books.reduce((a, b) => (a.addedAt > b.addedAt ? a : b))
    : null;

  // Track onboarding started (only once when step is 0)
  useEffect(() => {
    if (step === 0) {
      try {
        getAnalytics().track(AnalyticsEvents.onboardingStarted());
      } catch (error) {
        console.error('[Onboarding] Failed to track onboarding_started:', error);
      }
    }
  }, []);

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
  const handleNext = () => {
    try {
      getAnalytics().track(AnalyticsEvents.onboardingStepCompleted(0, 'welcome'));
    } catch (error) {
      console.error('[Onboarding] Failed to track step 0 completion:', error);
    }
    onNext();
  };

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
        <Button onPress={handleNext} shape="pill" className="w-full">
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

  const [mode, setMode] = useState<"choose" | "search" | "manual">("choose");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { data: searchResults = [], isLoading, error } = useSearchBooks(debouncedQuery);
  const { data: suggestedBooks = [], isLoading: isLoadingSuggestions } = useSearchBooks(
    mode === "search" && !debouncedQuery ? "subject:fiction" : "",
    "relevance"
  );
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
    if (bookId) {
      try {
        getAnalytics().track(
          AnalyticsEvents.bookAddedOnboarding(
            book.id,
            book.title,
            book.authors?.join(", "),
            book.source
          )
        );
        getAnalytics().track(AnalyticsEvents.onboardingStepCompleted(1, 'add_book'));
      } catch (error) {
        console.error('[Onboarding] Failed to track book added:', error);
      }
      onBookAdded();
    }
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
    if (bookId) {
      try {
        getAnalytics().track(
          AnalyticsEvents.bookAddedOnboarding(
            book.id,
            book.title,
            book.authors?.join(", "),
            book.source
          )
        );
        getAnalytics().track(AnalyticsEvents.onboardingStepCompleted(1, 'add_book'));
      } catch (error) {
        console.error('[Onboarding] Failed to track book added:', error);
      }
      onBookAdded();
    }
  };

  return (
    <View className="flex-1">
      <Animated.View entering={FadeInDown.duration(400)} className="items-center py-4">
        <Text className="text-foreground font-serif text-xl font-semibold">
          Add Your First Book
        </Text>
        <Text className="text-muted text-sm mt-1">What are you currently reading?</Text>
      </Animated.View>

      {/* Initial choice view - 3 option cards */}
      {mode === "choose" && (
        <View className="flex-1 justify-center pb-12 px-4">
          <Animated.View entering={FadeInDown.duration(400).delay(200)} className="items-center mb-8">
            <Text className="text-foreground text-lg font-serif-italic italic text-center">
              How would you like to add it?
            </Text>
          </Animated.View>

          <View className="gap-3">
            <Animated.View entering={FadeInDown.duration(400).delay(300)}>
              <Pressable
                onPress={() => {
                  try {
                    getAnalytics().track(AnalyticsEvents.onboardingMethodSelected('search'));
                  } catch (error) {
                    console.error('[Onboarding] Failed to track method selected:', error);
                  }
                  setMode("search");
                }}
                className="bg-card border border-primary/30 rounded-2xl p-4 flex-row items-center gap-4"
              >
                <View className="bg-primary/10 rounded-full p-3">
                  <MagnifyingGlassIcon size={24} color={primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-medium text-base mb-0.5">
                    Search for a book
                  </Text>
                  <Text className="text-muted text-sm">
                    Find by title or author
                  </Text>
                </View>
              </Pressable>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(400).delay(400)}>
              <Pressable
                onPress={() => {
                  try {
                    getAnalytics().track(AnalyticsEvents.onboardingMethodSelected('scan'));
                  } catch (error) {
                    console.error('[Onboarding] Failed to track method selected:', error);
                  }
                  setIsScannerOpen(true);
                }}
                className="bg-card border border-border rounded-2xl p-4 flex-row items-center gap-4"
              >
                <View className="bg-card-foreground/10 rounded-full p-3">
                  <ViewfinderCircleIcon size={24} color={primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-medium text-base mb-0.5">
                    Scan barcode
                  </Text>
                  <Text className="text-muted text-sm">
                    Use your camera to scan ISBN
                  </Text>
                </View>
              </Pressable>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(400).delay(500)}>
              <Pressable
                onPress={() => {
                  try {
                    getAnalytics().track(AnalyticsEvents.onboardingMethodSelected('manual'));
                  } catch (error) {
                    console.error('[Onboarding] Failed to track method selected:', error);
                  }
                  setMode("manual");
                }}
                className="bg-card border border-border rounded-2xl p-4 flex-row items-center gap-4"
              >
                <View className="bg-card-foreground/10 rounded-full p-3">
                  <PencilIcon size={24} color={primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-medium text-base mb-0.5">
                    Enter manually
                  </Text>
                  <Text className="text-muted text-sm">
                    Type in title and author
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          </View>
        </View>
      )}

      {/* Search mode - show search input and results */}
      {mode === "search" && (
        <>
          <Animated.View entering={FadeInDown.duration(300)} className="mb-3">
            <BookSearchInput
              value={query}
              onChangeText={setQuery}
              onClear={() => setQuery("")}
              onScanPress={() => setIsScannerOpen(true)}
              autoFocus={true}
            />
          </Animated.View>

          <View className="flex-1">
            <BookSearchResults
              results={debouncedQuery ? searchResults : suggestedBooks}
              isLoading={debouncedQuery ? isLoading : isLoadingSuggestions}
              error={error ? error.message : null}
              query={debouncedQuery}
              isInLibrary={isInLibrary}
              onSelectBook={handleSelectBook}
              onManualCreate={() => setMode("manual")}
              showAsSuggestions={!debouncedQuery}
            />
          </View>

          <Pressable
            onPress={() => {
              setQuery("");
              setMode("choose");
            }}
            className="items-center py-4"
          >
            <Text className="text-muted text-sm">← Back to options</Text>
          </Pressable>
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

            <Pressable
              onPress={() => {
                setManualTitle("");
                setManualAuthor("");
                setMode("choose");
              }}
              className="items-center py-2"
            >
              <Text className="text-muted text-sm">← Back to options</Text>
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

  const completeOnboarding = async (addedFirstImpression: boolean) => {
    try {
      getAnalytics().track(
        AnalyticsEvents.onboardingCompleted(true, addedFirstImpression)
      );
    } catch (error) {
      console.error('[Onboarding] Failed to track onboarding completion:', error);
    }
    await setOnboardingStep(3);
    router.replace("/");
  };

  const handleSave = async () => {
    const hasText = firstImpression.trim().length > 0;
    if (hasText) {
      updateBook(bookId, {
        firstImpression: firstImpression.trim(),
        firstImpressionAudioUri: audioUri,
      });
      try {
        getAnalytics().track(
          AnalyticsEvents.firstImpressionAddedOnboarding(
            bookId,
            book?.title || 'Unknown',
            !!audioUri,
            hasText
          )
        );
        getAnalytics().track(AnalyticsEvents.onboardingStepCompleted(2, 'first_impression'));
      } catch (error) {
        console.error('[Onboarding] Failed to track first impression:', error);
      }
    }
    await completeOnboarding(hasText);
  };

  const handleSkip = async () => {
    try {
      getAnalytics().track(AnalyticsEvents.onboardingSkipped(2, 'first_impression'));
    } catch (error) {
      console.error('[Onboarding] Failed to track skip:', error);
    }
    await completeOnboarding(false);
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
