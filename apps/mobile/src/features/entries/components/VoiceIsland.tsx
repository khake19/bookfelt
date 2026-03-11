import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { Portal } from "@rn-primitives/portal";
import { Button } from "@bookfelt/ui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { StopIcon } from "react-native-heroicons/solid";
import { XMarkIcon } from "react-native-heroicons/outline";
import { transcribeAudio } from "@bookfelt/core";

const MAX_DURATION_S = 60;
const WARNING_THRESHOLD_S = 50;
const NUM_BARS = 32;
const PILL_COMPACT_HEIGHT = 64;
const PILL_EXPANDED_HEIGHT = 280;
const PILL_H_MARGIN = 16;
const TYPEWRITER_INTERVAL_MS = 30;

const ISLAND_BG = "hsl(20, 25%, 12%)";

const SPRING_CONFIG = { damping: 20, stiffness: 150 };

type Phase = "permission" | "recording" | "stopped" | "processing" | "result" | "error";

const COVER_SIZE = 36;

interface VoiceIslandProps {
  bookCoverUrl?: string;
  bookTitle?: string;
  bookAuthor?: string;
  onSave: (transcription: string, audioUri: string) => void;
  onEdit: (transcription: string, audioUri: string) => void;
  onClose: () => void;
}

const VoiceIsland = ({ bookCoverUrl, bookTitle, bookAuthor, onSave, onEdit, onClose }: VoiceIslandProps) => {
  const insets = useSafeAreaInsets();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [phase, setPhase] = useState<Phase>("permission");
  const [elapsed, setElapsed] = useState(0);
  const [meteringLevels, setMeteringLevels] = useState<number[]>(
    () => new Array(NUM_BARS).fill(0)
  );
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [displayedWordCount, setDisplayedWordCount] = useState(0);

  const warningProgress = useSharedValue(0);
  const islandHeight = useSharedValue(PILL_COMPACT_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  // Permission handling
  const handleRequestPermission = useCallback(async () => {
    if (permissionResponse?.canAskAgain === false) {
      Linking.openSettings();
      return;
    }
    const result = await requestPermission();
    if (!result.granted && !result.canAskAgain) {
      Linking.openSettings();
    }
  }, [requestPermission, permissionResponse?.canAskAgain]);

  // Skip permission phase if already granted
  useEffect(() => {
    if (permissionResponse?.granted && phase === "permission") {
      setPhase("recording");
    }
  }, [permissionResponse?.granted, phase]);

  const normalizeMetering = (dB: number): number => {
    const clamped = Math.max(-60, Math.min(0, dB));
    return (clamped + 60) / 60;
  };

  const stopRecording = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording) return;

    recordingRef.current = null;

    try {
      await recording.stopAndUnloadAsync();
    } catch {
      // already stopped
    }

    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

    const uri = recording.getURI();
    if (!uri) return;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setAudioUri(uri);
    setPhase("stopped");
  }, []);

  const handleTranscribe = useCallback(async () => {
    if (!audioUri) return;
    setPhase("processing");
    const fileName = `voice-${Date.now()}.m4a`;
    try {
      const result = await transcribeAudio(audioUri, fileName);
      setTranscription(result.text);
      setPhase("result");
    } catch (e: any) {
      setError(e?.message || "Transcription failed. Please try again.");
      setPhase("error");
    }
  }, [audioUri]);

  const startRecording = useCallback(async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
      (status) => {
        if (!status.isRecording) return;

        const seconds = Math.floor((status.durationMillis ?? 0) / 1000);
        setElapsed(seconds);

        const metering = status.metering ?? -160;
        const normalized = normalizeMetering(metering);
        setMeteringLevels((prev) => [...prev.slice(1), normalized]);

        if (seconds >= MAX_DURATION_S) {
          stopRecording();
        }
      },
      100
    );

    recordingRef.current = recording;
  }, [stopRecording]);

  // Auto-start recording when phase becomes "recording"
  useEffect(() => {
    if (phase === "recording" && !recordingRef.current) {
      startRecording();
    }
  }, [phase, startRecording]);

  // Warning animation at 50s
  useEffect(() => {
    if (elapsed >= WARNING_THRESHOLD_S) {
      warningProgress.value = withTiming(1, { duration: 2000 });
    }
  }, [elapsed >= WARNING_THRESHOLD_S]);

  // Animate island height based on phase
  useEffect(() => {
    if (phase === "result") {
      islandHeight.value = withSpring(PILL_EXPANDED_HEIGHT, SPRING_CONFIG);
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else if (phase === "recording" || phase === "stopped" || phase === "processing") {
      islandHeight.value = withSpring(PILL_COMPACT_HEIGHT, SPRING_CONFIG);
      backdropOpacity.value = withTiming(0, { duration: 200 });
    } else if (phase === "error") {
      islandHeight.value = withSpring(160, SPRING_CONFIG);
      backdropOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [phase]);

  // Typewriter effect
  useEffect(() => {
    if (phase !== "result" || !transcription) return;

    const words = transcription.split(" ");
    setDisplayedWordCount(0);

    const interval = setInterval(() => {
      setDisplayedWordCount((prev) => {
        if (prev >= words.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, TYPEWRITER_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [phase, transcription]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const recording = recordingRef.current;
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
        Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
      }
    };
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRetry = useCallback(() => {
    setError(null);
    handleTranscribe();
  }, [handleTranscribe]);

  const islandAnimatedStyle = useAnimatedStyle(() => ({
    height: islandHeight.value,
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value * 0.15,
    pointerEvents:
      backdropOpacity.value > 0.01 ? ("auto" as const) : ("none" as const),
  }));

  // Permission screen — full-screen overlay like before
  if (phase === "permission" && !permissionResponse?.granted) {
    return (
      <Portal name="voice-island">
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={{ backgroundColor: ISLAND_BG }}
          className="absolute inset-0"
        >
          <View className="flex-1 items-center justify-center px-8 gap-5">
            <Text className="text-white text-lg font-semibold text-center">
              Microphone Access Needed
            </Text>
            <Text className="text-white/70 text-sm text-center leading-relaxed">
              Bookfelt needs microphone access to record voice reflections. Your
              audio is only used for transcription.
            </Text>
            <Button onPress={handleRequestPermission} shape="pill">
              <Text className="text-background text-center font-medium">
                Allow Microphone Access
              </Text>
            </Button>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text className="text-white/50 text-sm">Not now</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Portal>
    );
  }

  const displayedText = transcription
    ? transcription
        .split(" ")
        .slice(0, displayedWordCount)
        .join(" ")
    : "";

  return (
    <Portal name="voice-island">
      {/* Backdrop — only visible during result/error */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#000",
          },
          backdropAnimatedStyle,
        ]}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={onClose}
        />
      </Animated.View>

      {/* Island pill */}
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={[
          {
            position: "absolute",
            top: insets.top + 8,
            left: PILL_H_MARGIN,
            right: PILL_H_MARGIN,
            backgroundColor: ISLAND_BG,
            borderRadius: 28,
            overflow: "hidden",
          },
          islandAnimatedStyle,
        ]}
      >
        {/* Close button — top right, only in result/error states */}
        {(phase === "result" || phase === "error") && (
          <Pressable
            onPress={onClose}
            hitSlop={8}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 10,
            }}
          >
            <XMarkIcon size={18} color="rgba(255,255,255,0.5)" />
          </Pressable>
        )}

        {/* Recording state */}
        {phase === "recording" && (
          <View className="flex-1 flex-row items-center px-3 gap-2.5">
            {/* Book cover + info */}
            {bookCoverUrl && (
              <View className="flex-row items-center gap-2.5" style={{ maxWidth: 120 }}>
                <Image
                  source={{ uri: bookCoverUrl }}
                  style={{
                    width: COVER_SIZE,
                    height: COVER_SIZE,
                    borderRadius: COVER_SIZE / 2,
                    borderWidth: 1.5,
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                  resizeMode="cover"
                />
                {bookTitle && (
                  <View className="shrink" style={{ maxWidth: 72 }}>
                    <Text
                      className="text-white/80 text-[10px] font-medium"
                      numberOfLines={1}
                    >
                      {bookTitle}
                    </Text>
                    {bookAuthor && (
                      <Text
                        className="text-white/40 text-[9px]"
                        numberOfLines={1}
                      >
                        {bookAuthor}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Waveform bars */}
            <View className="flex-1 flex-row items-center justify-between">
              {meteringLevels.map((level, i) => (
                <WaveformBar
                  key={i}
                  level={level}
                  warningProgress={warningProgress}
                />
              ))}
            </View>

            {/* Timer */}
            <Text className="text-white/60 text-[10px] font-mono tracking-wider min-w-[34px] text-right">
              {formatTime(elapsed)}
            </Text>

            {/* Stop button */}
            <Pressable
              onPress={stopRecording}
              className="w-9 h-9 rounded-full bg-primary items-center justify-center"
            >
              <StopIcon size={14} color="white" />
            </Pressable>
          </View>
        )}

        {/* Stopped state — confirm or discard */}
        {phase === "stopped" && (
          <View className="flex-1 flex-row items-center px-3 gap-2.5">
            {/* Book cover + info */}
            {bookCoverUrl && (
              <View className="flex-row items-center gap-2.5" style={{ maxWidth: 120 }}>
                <Image
                  source={{ uri: bookCoverUrl }}
                  style={{
                    width: COVER_SIZE,
                    height: COVER_SIZE,
                    borderRadius: COVER_SIZE / 2,
                    borderWidth: 1.5,
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                  resizeMode="cover"
                />
                {bookTitle && (
                  <View className="shrink" style={{ maxWidth: 72 }}>
                    <Text
                      className="text-white/80 text-[10px] font-medium"
                      numberOfLines={1}
                    >
                      {bookTitle}
                    </Text>
                    {bookAuthor && (
                      <Text
                        className="text-white/40 text-[9px]"
                        numberOfLines={1}
                      >
                        {bookAuthor}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}
            <Text className="text-white/50 text-[10px] font-mono">
              {formatTime(elapsed)}
            </Text>
            <View className="flex-1" />
            <Pressable onPress={onClose} hitSlop={8} className="py-2 px-3">
              <Text className="text-white/40 text-sm">Discard</Text>
            </Pressable>
            <Pressable
              onPress={handleTranscribe}
              className="bg-white/15 rounded-full py-1.5 px-4"
            >
              <Text className="text-white text-sm font-medium">
                Transcribe
              </Text>
            </Pressable>
          </View>
        )}

        {/* Processing state — frozen waveform with spinner overlay */}
        {phase === "processing" && (
          <View className="flex-1 flex-row items-center px-3 gap-2.5">
            {/* Book cover + info */}
            {bookCoverUrl && (
              <View className="flex-row items-center gap-2.5" style={{ maxWidth: 120 }}>
                <Image
                  source={{ uri: bookCoverUrl }}
                  style={{
                    width: COVER_SIZE,
                    height: COVER_SIZE,
                    borderRadius: COVER_SIZE / 2,
                    borderWidth: 1.5,
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                  resizeMode="cover"
                />
                {bookTitle && (
                  <View className="shrink" style={{ maxWidth: 72 }}>
                    <Text
                      className="text-white/80 text-[10px] font-medium"
                      numberOfLines={1}
                    >
                      {bookTitle}
                    </Text>
                    {bookAuthor && (
                      <Text
                        className="text-white/40 text-[9px]"
                        numberOfLines={1}
                      >
                        {bookAuthor}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Frozen waveform with spinner */}
            <View className="flex-1">
              {/* Faded bars */}
              <View className="flex-row items-center justify-between" style={{ opacity: 0.3 }}>
                {meteringLevels.map((level, i) => {
                  const minH = 4;
                  const maxH = 28;
                  const h = minH + level * (maxH - minH);
                  return (
                    <View
                      key={i}
                      style={{
                        height: h,
                        width: 2,
                        borderRadius: 1,
                        backgroundColor: "rgba(255,255,255,0.7)",
                      }}
                    />
                  );
                })}
              </View>
              {/* Spinner centered on top */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
              </View>
            </View>

            {/* Timer frozen */}
            <Text className="text-white/30 text-[10px] font-mono tracking-wider min-w-[34px] text-right">
              {formatTime(elapsed)}
            </Text>
          </View>
        )}

        {/* Result state */}
        {phase === "result" && transcription && (
          <View className="flex-1 px-5 pt-5 pb-4">
            <Text className="text-white/40 text-[10px] font-medium uppercase tracking-widest mb-2">
              Your Reflection
            </Text>
            <ScrollView className="flex-1 mb-3" showsVerticalScrollIndicator={false}>
              <Text className="text-white text-sm leading-relaxed font-serif">
                {displayedText}
              </Text>
            </ScrollView>
            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <Button
                  onPress={() => onSave(transcription, audioUri!)}
                  shape="pill"
                >
                  <Text className="text-background text-center font-medium text-sm">
                    Save
                  </Text>
                </Button>
              </View>
              <Pressable
                onPress={() => onEdit(transcription, audioUri!)}
                className="py-2 px-3"
              >
                <Text className="text-white/50 text-sm">Edit</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Error state */}
        {phase === "error" && (
          <View className="flex-1 items-center justify-center px-5 gap-3">
            <Text className="text-red-400 text-sm text-center">
              {error}
            </Text>
            <Button onPress={handleRetry} shape="pill">
              <Text className="text-background text-center font-medium text-sm">
                Try Again
              </Text>
            </Button>
          </View>
        )}
      </Animated.View>
    </Portal>
  );
};

function WaveformBar({
  level,
  warningProgress,
}: {
  level: number;
  warningProgress: SharedValue<number>;
}) {
  const minHeight = 4;
  const maxHeight = 28;
  const height = minHeight + level * (maxHeight - minHeight);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      warningProgress.value,
      [0, 1],
      ["rgba(255, 255, 255, 0.7)", "rgba(245, 180, 80, 0.85)"]
    ),
  }));

  return (
    <Animated.View
      style={[{ height, width: 2, borderRadius: 1 }, animatedStyle]}
    />
  );
}

export default VoiceIsland;
