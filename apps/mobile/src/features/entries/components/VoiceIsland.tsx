import { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
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
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { StopIcon } from "react-native-heroicons/solid";

const DEFAULT_MAX_DURATION_S = 60;
const NUM_BARS = 32;
const PILL_H_MARGIN = 16;
const ISLAND_BG = "hsl(20, 25%, 12%)";
const COVER_SIZE = 36;

type Phase = "permission" | "recording" | "stopped";

interface VoiceIslandProps {
  bookCoverUrl?: string;
  bookTitle?: string;
  bookAuthor?: string;
  maxDurationS?: number;
  countUp?: boolean;
  onSave: (audioUri: string) => void;
  onClose: () => void;
}

const VoiceIsland = ({ bookCoverUrl, bookTitle, bookAuthor, maxDurationS = DEFAULT_MAX_DURATION_S, countUp = false, onSave, onClose }: VoiceIslandProps) => {
  const insets = useSafeAreaInsets();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [phase, setPhase] = useState<Phase>("permission");
  const [elapsed, setElapsed] = useState(0);
  const [meteringLevels, setMeteringLevels] = useState<number[]>(
    () => new Array(NUM_BARS).fill(0)
  );
  const [audioUri, setAudioUri] = useState<string | null>(null);

  const warningProgress = useSharedValue(0);

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

        if (seconds >= maxDurationS) {
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

  // Warning animation near end
  const warningThresholdS = maxDurationS - 10;
  useEffect(() => {
    if (elapsed >= warningThresholdS) {
      warningProgress.value = withTiming(1, { duration: 2000 });
    }
  }, [elapsed >= warningThresholdS]);

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

  const handleConfirm = useCallback(() => {
    if (audioUri) {
      onSave(audioUri);
    }
  }, [audioUri, onSave]);

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

  return (
    <Portal name="voice-island">
      {/* Island pill */}
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={{
          position: "absolute",
          top: insets.top + 8,
          left: PILL_H_MARGIN,
          right: PILL_H_MARGIN,
          height: 64,
          backgroundColor: ISLAND_BG,
          borderRadius: 28,
          overflow: "hidden",
          borderWidth: 1.5,
          borderColor: "rgba(255, 255, 255, 0.3)",
        }}
      >
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
              {formatTime(countUp ? elapsed : maxDurationS - elapsed)}
            </Text>

            {/* Stop button */}
            <Pressable
              onPress={stopRecording}
              className="w-9 h-9 rounded-full items-center justify-center"
            >
              {({ pressed }) => (
                <>
                  <View className={`absolute inset-0 rounded-full ${pressed ? "bg-primary/80" : "bg-primary"}`} />
                  <StopIcon size={14} color="white" />
                </>
              )}
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
              {formatTime(countUp ? elapsed : maxDurationS - elapsed)}
            </Text>
            <View className="flex-1" />
            <Pressable onPress={onClose} hitSlop={8} className="py-2 px-3">
              {({ pressed }) => (
                <Text className={`text-sm ${pressed ? "text-white/60" : "text-white/40"}`}>Discard</Text>
              )}
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              className="rounded-full py-1.5 px-4"
            >
              {({ pressed }) => (
                <>
                  <View className={`absolute inset-0 rounded-full ${pressed ? "bg-white/25" : "bg-white/15"}`} />
                  <Text className="text-white text-sm font-medium">
                    Confirm
                  </Text>
                </>
              )}
            </Pressable>
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
