import { useCallback, useEffect, useRef, useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { Portal } from "@rn-primitives/portal";
import { Button } from "@bookfelt/ui";
import Animated, {
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StopIcon } from "react-native-heroicons/solid";

const MAX_DURATION_S = 60;
const WARNING_THRESHOLD_S = 50;
const NUM_BARS = 40;

interface VoiceRecordingOverlayProps {
  onRecordingComplete: (audioUri: string, fileName: string) => void;
  onClose: () => void;
}

const VoiceRecordingOverlay = ({
  onRecordingComplete,
  onClose,
}: VoiceRecordingOverlayProps) => {
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [meteringLevels, setMeteringLevels] = useState<number[]>(
    () => new Array(NUM_BARS).fill(0)
  );
  const [isRecording, setIsRecording] = useState(false);
  const warningProgress = useSharedValue(0);

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

  const normalizeMetering = (dB: number): number => {
    // expo-av metering ranges roughly from -160 to 0
    const clamped = Math.max(-60, Math.min(0, dB));
    return (clamped + 60) / 60;
  };

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
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording) return;

    setIsRecording(false);
    recordingRef.current = null;

    try {
      await recording.stopAndUnloadAsync();
    } catch {
      // already stopped
    }

    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

    const uri = recording.getURI();
    if (!uri) return;

    // Haptic feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const fileName = `voice-${Date.now()}.m4a`;
    onRecordingComplete(uri, fileName);
  }, [onRecordingComplete]);

  // Auto-start recording when permission is granted
  useEffect(() => {
    if (permissionResponse?.granted && !isRecording && !recordingRef.current) {
      startRecording();
    }
  }, [permissionResponse?.granted, startRecording]);

  // Warning animation at 50s
  useEffect(() => {
    if (elapsed >= WARNING_THRESHOLD_S) {
      warningProgress.value = withTiming(1, { duration: 2000 });
    }
  }, [elapsed >= WARNING_THRESHOLD_S]);

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

  if (!permissionResponse?.granted) {
    return (
      <Portal name="voice-recorder">
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={{ backgroundColor: "hsl(20, 25%, 12%)" }}
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
    <Portal name="voice-recorder">
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={{ backgroundColor: "hsl(20, 25%, 12%)" }}
        className="absolute inset-0 items-center justify-center"
      >
        {/* Waveform */}
        <View className="flex-row items-center justify-center gap-[3px] h-40 px-8">
          {meteringLevels.map((level, i) => (
            <WaveformBar
              key={i}
              level={level}
              warningProgress={warningProgress}
            />
          ))}
        </View>

        {/* Timer */}
        <Text className="text-white/60 text-base font-mono mt-8 tracking-widest">
          {formatTime(elapsed)}
        </Text>

        {/* Stop button */}
        <Pressable
          onPress={stopRecording}
          className="mt-10 w-16 h-16 rounded-full bg-red-500 items-center justify-center"
        >
          <StopIcon size={28} color="white" />
        </Pressable>

        <Text className="text-white/40 text-xs mt-4">Tap to stop</Text>
      </Animated.View>
    </Portal>
  );
};

function WaveformBar({
  level,
  warningProgress,
}: {
  level: number;
  warningProgress: Animated.SharedValue<number>;
}) {
  const minHeight = 4;
  const maxHeight = 120;
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
      style={[{ height, width: 3, borderRadius: 1.5 }, animatedStyle]}
    />
  );
}

export default VoiceRecordingOverlay;
