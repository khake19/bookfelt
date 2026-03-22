import { Button } from "@bookfelt/ui";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MicrophoneIcon } from "react-native-heroicons/outline";
import { useLibrary } from "../features/books/hooks/use-library";
import AudioPlayer from "../features/entries/components/AudioPlayer";
import VoiceIsland from "../features/entries/components/VoiceIsland";
import { FocusModeOverlay, RichTextPreview, ScreenWrapper, TranscribingIndicator, useThemeColors } from "../shared";
import { useTranscriptionStore } from "../shared/stores/transcription.store";
import { deleteAudioFiles } from "../lib/audio-sync";
import { useBookLimits, CustomPaywall, UpgradePrompts } from "../features/premium";

export default function FirstImpressionScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const router = useRouter();
  const { books, updateBook } = useLibrary();
  const book = books.find((b) => b.id === bookId);
  const { mutedForeground } = useThemeColors();
  const { limits } = useBookLimits(bookId);

  const [firstImpression, setFirstImpression] = useState("");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [audioUri, setAudioUri] = useState<string | undefined>();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

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

  const handleSave = () => {
    if (firstImpression.trim()) {
      updateBook(bookId, {
        firstImpression: firstImpression.trim(),
        firstImpressionAudioUri: audioUri,
      });
    }
    router.dismissAll();
  };

  const handleSkip = () => {
    router.dismissAll();
  };

  const handleVoicePress = () => {
    if (!limits.bookends.canUse) {
      UpgradePrompts.bookendLimit(() => setShowPaywall(true));
      return;
    }
    setIsVoiceOpen(true);
  };

  if (!book) {
    return (
      <ScreenWrapper>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-sm">Book not found</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8 flex-grow justify-center"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center">
          {/* Book cover + info */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            className="items-center"
          >
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
            <Text className="text-muted text-sm mt-1">
              {book.authors.join(", ")}
            </Text>
          </Animated.View>

          {/* Gold divider */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(300)}
            className="my-6 w-16 h-px bg-primary/20"
          />

          {/* Prompts */}
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
          <Animated.View
            entering={FadeInDown.duration(500).delay(700)}
            className="w-full"
          >
            <Pressable
              onPress={() => setIsFocusMode(true)}
              className="border border-primary/30 rounded-2xl bg-card p-5 min-h-[120px]"
            >
              <Pressable
                onPress={handleVoicePress}
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
                <AudioPlayer
                  uri={audioUri}
                  onDelete={() => {
                    const uriToDelete = audioUri;
                    setAudioUri(undefined);
                    deleteAudioFiles([uriToDelete])
                      .then(() => console.log('[first-impression] Audio deleted'))
                      .catch(err => console.error('[first-impression] Delete failed:', err));
                  }}
                />
              </View>
            )}
          </Animated.View>

          {/* Actions */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(900)}
            className="w-full mt-8"
          >
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

      <CustomPaywall
        visible={showPaywall}
        onDismiss={() => setShowPaywall(false)}
        onPurchaseSuccess={() => setShowPaywall(false)}
      />
    </ScreenWrapper>
  );
}
