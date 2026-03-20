import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Audio, AVPlaybackStatus } from "expo-av";
import { PlayIcon, PauseIcon } from "react-native-heroicons/solid";
import { TrashIcon } from "react-native-heroicons/outline";
import { useThemeColors } from "../../../shared/hooks/use-theme-colors";

interface AudioPlayerProps {
  uri: string;
  onDelete?: () => void;
}


const AudioPlayer = ({ uri, onDelete }: AudioPlayerProps) => {
  const { primary, muted, destructive } = useThemeColors();
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [positionMs, setPositionMs] = useState(0);
  const [waveformWidth, setWaveformWidth] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Validate URI
  const isValidUri = uri && uri.trim().length > 0 && (uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('file://'));

  const progress = durationMs > 0 ? positionMs / durationMs : 0;

  const onStatus = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error('[AudioPlayer] Load error:', status.error);
        setHasError(true);
      }
      return;
    }
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

    // Validate URI and set error state immediately if invalid
    if (!isValidUri) {
      console.warn('[AudioPlayer] Invalid URI detected:', uri);
      setHasError(true);
      return;
    }

    setHasError(false);

    // Load audio to get duration without playing
    const loadAudio = async () => {
      try {
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
      } catch (error) {
        console.error('[AudioPlayer] Failed to load audio:', error);
        setHasError(true);
      }
    };

    loadAudio();

    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, [uri, isValidUri, onStatus]);

  const togglePlay = async () => {
    if (hasError || !isValidUri) {
      console.warn('[AudioPlayer] Cannot play: invalid URI or error state');
      setHasError(true);
      return;
    }

    try {
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
    } catch (error) {
      console.error('[AudioPlayer] Playback error:', error);
      setHasError(true);
    }
  };


  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSeek = async (event: any) => {
    if (!waveformWidth || durationMs === 0 || hasError) return;

    try {
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
    } catch (error) {
      console.error('[AudioPlayer] Seek error:', error);
      setHasError(true);
    }
  };

  const remainingMs = durationMs - positionMs;

  if (hasError) {
    return (
      <View className="flex-row items-center gap-3 rounded-xl bg-destructive/10 px-3 py-2 border border-destructive/30">
        <Text className="flex-1 text-xs text-destructive">
          Unable to load audio
        </Text>
        {onDelete && (
          <Pressable
            onPress={onDelete}
            hitSlop={8}
            className="px-2 py-1"
          >
            <Text className="text-xs text-destructive font-medium">Remove</Text>
          </Pressable>
        )}
      </View>
    );
  }

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
        className="flex-1 h-10 justify-center"
      >
        <View className="h-1 bg-muted/20 rounded-full overflow-hidden">
          <Animated.View
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              backgroundColor: primary,
            }}
          />
        </View>
      </Pressable>

      <Text className="text-xs text-muted tabular-nums">
        {formatTime(positionMs)}/{durationMs > 0 ? formatTime(durationMs) : "--:--"}
      </Text>

      {onDelete && (
        <Pressable
          onPress={onDelete}
          hitSlop={8}
          className="w-8 h-8 rounded-full items-center justify-center"
        >
          <TrashIcon size={16} color={destructive} />
        </Pressable>
      )}
    </View>
  );
};

export default AudioPlayer;
