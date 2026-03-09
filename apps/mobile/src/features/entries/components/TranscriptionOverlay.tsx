import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Portal } from "@rn-primitives/portal";
import { Button } from "@bookfelt/ui";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { XMarkIcon } from "react-native-heroicons/outline";
import { transcribeAudio } from "@bookfelt/core";

interface TranscriptionOverlayProps {
  audioUri: string;
  fileName: string;
  onSave: (transcription: string, audioUri: string) => void;
  onEdit: (transcription: string, audioUri: string) => void;
  onClose: () => void;
}

const TranscriptionOverlay = ({
  audioUri,
  fileName,
  onSave,
  onEdit,
  onClose,
}: TranscriptionOverlayProps) => {
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const transcribe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await transcribeAudio(audioUri, fileName);
      setTranscription(result.text);
    } catch (e: any) {
      setError(e?.message || "Transcription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [audioUri, fileName]);

  useEffect(() => {
    transcribe();
  }, [transcribe]);

  return (
    <Portal name="transcription">
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="absolute inset-0 bg-background"
      >
        {/* Close button */}
        <View className="absolute top-14 left-5 z-10">
          <Pressable
            onPress={onClose}
            hitSlop={8}
            className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center"
          >
            <XMarkIcon size={22} className="text-foreground" />
          </Pressable>
        </View>

        <View className="flex-1 justify-center px-8 pt-24 pb-10">
          {loading && (
            <View className="items-center gap-4">
              <ActivityIndicator size="large" />
              <Text className="text-foreground/60 text-sm font-serif italic">
                Transcribing your reflection...
              </Text>
            </View>
          )}

          {error && (
            <View className="items-center gap-4">
              <Text className="text-red-500 text-sm text-center">{error}</Text>
              <Button onPress={transcribe} shape="pill">
                <Text className="text-background text-center font-medium">
                  Try Again
                </Text>
              </Button>
            </View>
          )}

          {transcription && (
            <View className="flex-1 gap-6">
              <Text className="text-xs font-medium uppercase tracking-widest text-muted">
                Your Reflection
              </Text>
              <ScrollView className="flex-1">
                <Text className="text-foreground text-base leading-relaxed font-serif">
                  {transcription}
                </Text>
              </ScrollView>
              <View className="gap-3">
                <Button
                  onPress={() => onSave(transcription, audioUri)}
                  shape="pill"
                >
                  <Text className="text-background text-center font-medium">
                    Save
                  </Text>
                </Button>
                <Pressable
                  onPress={() => onEdit(transcription, audioUri)}
                  className="items-center py-2"
                >
                  <Text className="text-muted text-sm">
                    Edit before saving
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </Animated.View>
    </Portal>
  );
};

export default TranscriptionOverlay;
