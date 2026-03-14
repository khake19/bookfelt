import { useEffect, useState } from "react";
import { Button } from "@bookfelt/ui";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MicrophoneIcon } from "react-native-heroicons/outline";
import { useLibrary } from "../features/books/hooks/use-library";
import AudioPlayer from "../features/entries/components/AudioPlayer";
import VoiceIsland from "../features/entries/components/VoiceIsland";
import { FocusModeOverlay, RichTextPreview, ScreenWrapper, stripHtml, useThemeColors } from "../shared";
import { useTranscriptionStore } from "../shared/stores/transcription.store";

export default function FinalThoughtScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const router = useRouter();
  const { books, updateBook, updateStatus } = useLibrary();
  const book = books.find((b) => b.id === bookId);
  const { mutedForeground } = useThemeColors();

  const [finalThought, setFinalThought] = useState("");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [audioUri, setAudioUri] = useState<string | undefined>();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const transcriptionStatus = useTranscriptionStore((s) => s.status);
  const transcriptionText = useTranscriptionStore((s) => s.text);
  const startTranscription = useTranscriptionStore((s) => s.startTranscription);

  useEffect(() => {
    if (transcriptionStatus === "completed" && transcriptionText) {
      setFinalThought(transcriptionText);
    }
  }, [transcriptionStatus, transcriptionText]);

  const handleSave = () => {
    if (finalThought.trim()) {
      updateBook(bookId, {
        finalThought: finalThought.trim(),
        finalThoughtAudioUri: audioUri,
      });
    }
    updateStatus(bookId, "finished");
    router.push({ pathname: "/book-summary", params: { bookId, source: "finished" } });
  };

  const handleSkip = () => {
    updateStatus(bookId, "finished");
    router.push({ pathname: "/book-summary", params: { bookId, source: "finished" } });
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
            <Text className="text-muted text-sm mt-1">
              {book.authors.join(", ")}
            </Text>
          </Animated.View>

          {/* Gold divider */}
          <Animated.View entering={FadeInDown.duration(500).delay(300)} className="my-6 w-16 h-px bg-primary/20" />

          {/* First impression recall */}
          {book.firstImpression && (
            <Animated.View entering={FadeInDown.duration(500).delay(400)} className="w-full mb-6">
              <View className="bg-card rounded-2xl px-4 py-3">
                <Text className="text-muted/60 text-xs uppercase tracking-widest mb-1">
                  First Impression
                </Text>
                <Text className="text-muted italic text-sm leading-relaxed">
                  "{stripHtml(book.firstImpression)}"
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Prompts */}
          <Animated.View entering={FadeInDown.duration(500).delay(500)} className="items-center mb-6">
            <Text className="text-foreground font-serif-italic text-base italic">
              The journey is complete.
            </Text>
            <Text className="text-muted text-sm mt-2 text-center px-6">
              What are your final thoughts on this story?
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
              {finalThought ? (
                <RichTextPreview html={finalThought} />
              ) : (
                <Text className="text-sm text-muted/60 italic">
                  Tap to write your final thought...
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
                Complete the Journey
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
          content={finalThought}
          onChangeContent={setFinalThought}
          onDone={() => setIsFocusMode(false)}
          placeholder="How did this book leave you feeling?"
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
    </ScreenWrapper>
  );
}
