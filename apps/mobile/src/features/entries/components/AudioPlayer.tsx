import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Audio, AVPlaybackStatus } from "expo-av";
import { PlayIcon, PauseIcon } from "react-native-heroicons/solid";
import { useThemeColors } from "../../../shared/hooks/use-theme-colors";

interface AudioPlayerProps {
  uri: string;
}

const NUM_BARS = 45;

// Generate deterministic "waveform" from URI string
function generateBars(uri: string): number[] {
  let hash = 0;
  for (let i = 0; i < uri.length; i++) {
    hash = (hash * 31 + uri.charCodeAt(i)) | 0;
  }
  return Array.from({ length: NUM_BARS }, (_, i) => {
    const v = Math.abs(Math.sin(hash * (i + 1) * 0.3)) * 0.7 + 0.3;
    return v;
  });
}

const AudioPlayer = ({ uri }: AudioPlayerProps) => {
  const { primary, muted } = useThemeColors();
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [positionMs, setPositionMs] = useState(0);
  const [waveformWidth, setWaveformWidth] = useState(0);
  const bars = useMemo(() => generateBars(uri), [uri]);

  const progress = durationMs > 0 ? positionMs / durationMs : 0;

  const onStatus = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setPositionMs(status.positionMillis);
    setDurationMs(status.durationMillis ?? 0);
    setIsPlaying(status.isPlaying);
    if (status.didJustFinish) {
      setIsPlaying(false);
      setPositionMs(0);
    }
  }, []);

  useEffect(() => {
    // Reset when uri changes — unload previous sound
    soundRef.current?.unloadAsync().catch(() => {});
    soundRef.current = null;
    setIsPlaying(false);
    setPositionMs(0);
    setDurationMs(0);

    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, [uri]);

  const togglePlay = async () => {
    if (isPlaying) {
      await soundRef.current?.pauseAsync();
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    if (!soundRef.current) {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, progressUpdateIntervalMillis: 100 },
        onStatus
      );
      soundRef.current = sound;
    } else {
      if (positionMs === 0) {
        await soundRef.current.setPositionAsync(0);
      }
      await soundRef.current.playAsync();
    }
  };

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSeek = async (event: any) => {
    if (!waveformWidth || durationMs === 0) return;

    const locationX = event.nativeEvent.locationX;
    const percentage = Math.max(0, Math.min(1, locationX / waveformWidth));
    const newPosition = percentage * durationMs;

    if (!soundRef.current) {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false, progressUpdateIntervalMillis: 100 },
        onStatus
      );
      soundRef.current = sound;
    }

    await soundRef.current.setPositionAsync(newPosition);
  };

  const remainingMs = durationMs - positionMs;

  return (
    <View className="flex-row items-center gap-3 rounded-xl bg-primary/10 px-2.5 py-1">
      <Pressable
        onPress={togglePlay}
        hitSlop={8}
        className="w-8 h-8 rounded-full bg-primary/15 items-center justify-center"
      >
        {isPlaying ? (
          <PauseIcon size={14} color={primary} />
        ) : (
          <PlayIcon size={14} color={primary} style={{ marginLeft: 1 }} />
        )}
      </Pressable>

      <Pressable
        onPress={handleSeek}
        onLayout={(e) => setWaveformWidth(e.nativeEvent.layout.width)}
        className="flex-1 flex-row items-center gap-[2px] h-10"
      >
        {bars.map((level, i) => {
          const filled = i / NUM_BARS < progress;
          return (
            <AnimatedBar
              key={i}
              level={level}
              filled={filled}
              primary={primary}
              muted={muted ?? "gray"}
            />
          );
        })}
      </Pressable>

      <Text className="text-xs text-muted tabular-nums">
        {durationMs > 0 ? `-${formatTime(remainingMs)}` : ""}
      </Text>
    </View>
  );
};

interface AnimatedBarProps {
  level: number;
  filled: boolean;
  primary: string;
  muted: string;
}

const AnimatedBar = ({ level, filled, primary, muted }: AnimatedBarProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const minHeight = 6 + level * 10;
    const maxHeight = 6 + level * 22;
    const targetHeight = filled ? maxHeight : minHeight;

    return {
      height: withTiming(targetHeight, { duration: 200 }),
      backgroundColor: withTiming(filled ? primary : muted + "30", {
        duration: 200,
      }),
    };
  });

  return (
    <Animated.View className="rounded-full" style={[{ width: 2.5 }, animatedStyle]} />
  );
};

export default AudioPlayer;
