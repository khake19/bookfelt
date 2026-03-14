import { useEffect, useState } from "react";
import { Button } from "@bookfelt/ui";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MicrophoneIcon } from "react-native-heroicons/outline";
import { useLibrary } from "../features/books/hooks/use-library";
import AudioPlayer from "../features/entries/components/AudioPlayer";
import VoiceIsland from "../features/entries/components/VoiceIsland";
import { FocusModeOverlay, RichTextPreview, ScreenWrapper, useThemeColors } from "../shared";
import { useTranscriptionStore } from "../shared/stores/transcription.store";

export default function ExitInterviewScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const router = useRouter();
  const { books, updateBook, updateStatus } = useLibrary();
  const book = books.find((b) => b.id === bookId);
  const { mutedForeground } = useThemeColors();

  const [exitNote, setExitNote] = useState("");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [audioUri, setAudioUri] = useState<string | undefined>();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const transcriptionStatus = useTranscriptionStore((s) => s.status);
  const transcriptionText = useTranscriptionStore((s) => s.text);
  const startTranscription = useTranscriptionStore((s) => s.startTranscription);

  useEffect(() => {
    if (transcriptionStatus === "completed" && transcriptionText) {
      setExitNote(transcriptionText);
    }
  }, [transcriptionStatus, transcriptionText]);

  const handlePause = () => {
    if (exitNote.trim()) {
      updateBook(bookId, {
        exitNote: exitNote.trim(),
        exitNoteAudioUri: audioUri,
      });
    }
    updateStatus(bookId, "paused");
    router.dismissAll();
  };

  const handleShelve = () => {
    if (exitNote.trim()) {
      updateBook(bookId, {
        exitNote: exitNote.trim(),
        exitNoteAudioUri: audioUri,
      });
    }
    updateStatus(bookId, "dnf");
    router.push({ pathname: "/book-summary", params: { bookId, source: "dnf" } });
  };

  const handleSkip = () => {
    updateStatus(bookId, "paused");
    router.dismissAll();
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

          {/* Muted divider */}
          <Animated.View entering={FadeInDown.duration(500).delay(300)} className="my-6 w-16 h-px bg-muted/20" />

          {/* Prompts */}
          <Animated.View entering={FadeInDown.duration(500).delay(500)} className="items-center mb-6">
            <Text className="text-foreground font-serif-italic text-base italic">
              This journey is ending early.
            </Text>
            <Text className="text-muted text-sm mt-2 text-center px-6">
              Why are you putting it down?
            </Text>
          </Animated.View>

          {/* Writing card */}
          <Animated.View entering={FadeInDown.duration(500).delay(700)} className="w-full">
            <View className="flex-row items-center justify-between mb-1.5">
              <View />
              <Pressable
                onPress={() => setIsVoiceOpen(true)}
                hitSlop={8}
                className="p-1"
              >
                <MicrophoneIcon size={18} color={mutedForeground} />
              </Pressable>
            </View>
            <Pressable
              onPress={() => setIsFocusMode(true)}
              className="border border-muted/30 rounded-2xl bg-card p-5 min-h-[120px]"
            >
              {exitNote ? (
                <RichTextPreview html={exitNote} />
              ) : (
                <Text className="text-sm text-muted/60 italic">
                  Tap to write your exit note...
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
            <View className="flex-row gap-3">
              <Button onPress={handlePause} variant="outline" shape="pill" className="flex-1">
                <Text className="text-foreground text-center font-medium text-sm">
                  Not Now
                </Text>
              </Button>
              <Button onPress={handleShelve} variant="outline" shape="pill" className="flex-1">
                <Text className="text-foreground text-center font-medium text-sm">
                  Shelve Journey
                </Text>
              </Button>
            </View>
            <Pressable onPress={handleSkip} className="mt-4 items-center py-2">
              <Text className="text-muted text-sm">Skip</Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>

      {isFocusMode && (
        <FocusModeOverlay
          content={exitNote}
          onChangeContent={setExitNote}
          onDone={() => setIsFocusMode(false)}
          placeholder="What made you put this book down?"
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
