import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { PlayIcon, PauseIcon } from "react-native-heroicons/solid";
import { useThemeColors } from "../../../shared/hooks/use-theme-colors";

interface AudioPlayerProps {
  uri: string;
}

const NUM_BARS = 28;

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

  return (
    <View className="flex-row items-center gap-2 rounded-lg bg-card px-2.5 py-1.5">
      <Pressable
        onPress={togglePlay}
        hitSlop={8}
        className="w-6 h-6 rounded-full bg-primary/15 items-center justify-center"
      >
        {isPlaying ? (
          <PauseIcon size={10} color={primary} />
        ) : (
          <PlayIcon size={10} color={primary} style={{ marginLeft: 1 }} />
        )}
      </Pressable>

      <View className="flex-1 flex-row items-center gap-[1.5px] h-4">
        {bars.map((level, i) => {
          const filled = i / NUM_BARS <= progress;
          return (
            <View
              key={i}
              className="rounded-full"
              style={{
                width: 2,
                height: 3 + level * 10,
                backgroundColor: filled
                  ? primary
                  : (muted ?? "gray") + "30",
              }}
            />
          );
        })}
      </View>

      <Text className="text-[10px] text-muted tabular-nums">
        {durationMs > 0
          ? isPlaying
            ? formatTime(positionMs)
            : formatTime(durationMs)
          : ""}
      </Text>
    </View>
  );
};

export default AudioPlayer;
