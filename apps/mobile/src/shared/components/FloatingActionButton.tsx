import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, Alert } from 'react-native';
import { Portal } from '@rn-primitives/portal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  type SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  PlusIcon,
  PencilSquareIcon,
  CameraIcon,
  MicrophoneIcon,
} from 'react-native-heroicons/solid';
import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useThemeColors } from '../hooks/use-theme-colors';
import { useLibrary } from '../../features/books/hooks/use-library';
import { useEntries } from '../../features/entries/hooks/use-entries';
import TextScannerOverlay from '../../features/entries/components/TextScannerOverlay';
import VoiceIsland from '../../features/entries/components/VoiceIsland';
import { setPendingSnippet } from '../utils/pending-state';
import { useTranscriptionStore } from '../stores/transcription.store';
import { useBookLimits, CustomPaywall, UpgradePrompts } from '@/features/premium';

const SPRING_CONFIG = { damping: 15, stiffness: 180 };
const FAB_SIZE = 56;
const OPTION_SIZE = 48;
const OPTION_SPACING = 60;

type FabOptionProps = {
  icon: typeof PencilSquareIcon;
  index: number;
  progress: SharedValue<number>;
  foreground: string | undefined;
  card: string | undefined;
  border: string | undefined;
  onPress?: () => void;
  isOpen: boolean;
  disabled?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FabOption({ icon: Icon, index, progress, foreground, card, border, onPress, isOpen, disabled }: FabOptionProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const staggeredProgress = interpolate(
      progress.value,
      [index * 0.15, index * 0.15 + 0.7],
      [0, 1],
      'clamp'
    );
    return {
      opacity: staggeredProgress,
      transform: [
        { translateY: interpolate(staggeredProgress, [0, 1], [20, 0]) },
        { scale: interpolate(staggeredProgress, [0, 1], [0.8, 1]) },
      ],
    };
  });

  return (
    <AnimatedPressable
      style={[styles.optionCircle, { backgroundColor: card, borderColor: border, opacity: disabled ? 0.35 : 1, bottom: (index + 1) * OPTION_SPACING }, animatedStyle]}
      pointerEvents={isOpen ? 'auto' : 'none'}
      onPress={disabled ? undefined : onPress}
    >
      <Icon size={22} color={foreground} />
    </AnimatedPressable>
  );
}

const FAB_OPTIONS = [
  { icon: PencilSquareIcon, index: 0, key: 'write' },
  { icon: CameraIcon, index: 1, key: 'photo' },
  { icon: MicrophoneIcon, index: 2, key: 'audio' },
] as const;

export default function FloatingActionButton({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { primary, muted, foreground, background, card, border } = useThemeColors();
  const { primaryRead } = useLibrary();
  const { addEntry } = useEntries();
  const progress = useSharedValue(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isTextScannerOpen, setIsTextScannerOpen] = useState(false);
  const [isVoiceIslandOpen, setIsVoiceIslandOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const { limits } = useBookLimits(primaryRead?.id);

  const toggle = () => {
    const opening = progress.value <= 0.5;
    progress.value = withSpring(opening ? 1 : 0, SPRING_CONFIG);
    setIsOpen(opening);
  };

  const collapse = () => {
    progress.value = withSpring(0, SPRING_CONFIG);
    setIsOpen(false);
  };

  const handleWrite = () => {
    collapse();
    router.navigate('/entry-detail');
  };

  const handlePhoto = () => {
    collapse();
    setIsTextScannerOpen(true);
  };

  const handleAudio = () => {
    if (!primaryRead) {
      collapse();
      Alert.alert(
        "No Book Selected",
        "Please select a book to start reading before recording a reflection."
      );
      return;
    }

    console.log('[FAB Audio] Checking limit:', {
      canUse: limits.audioTranscriptions.canUse,
      used: limits.audioTranscriptions.used,
      limit: limits.audioTranscriptions.limit,
      remaining: limits.audioTranscriptions.remaining,
    });

    // Check if user can transcribe audio
    if (!limits.audioTranscriptions.canUse) {
      collapse();
      UpgradePrompts.audioTranscriptionLimit(() => setShowPaywall(true));
      return;
    }

    collapse();
    setIsVoiceIslandOpen(true);
  };

  const handleTextCaptured = (text: string) => {
    setPendingSnippet(text);
    setIsTextScannerOpen(false);
    setTimeout(() => {
      router.navigate('/entry-detail');
    }, 300);
  };

  const handleVoiceSave = async (audioUri: string) => {
    if (!primaryRead) return;
    useTranscriptionStore.getState().reset();

    const entryId = await addEntry({
      bookId: primaryRead.id,
      bookTitle: primaryRead.title,
      reflectionUri: audioUri, // Always save audio when transcribing
      date: Date.now(),
    });
    setIsVoiceIslandOpen(false);

    if (entryId) {
      const { startTranscription, registerEntryId } = useTranscriptionStore.getState();
      startTranscription(audioUri);
      registerEntryId(entryId);
    }
  };

  const mainIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(progress.value, [0, 1], [0, 45], 'clamp')}deg` }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1], 'clamp'),
    pointerEvents: progress.value > 0.01 ? 'auto' : 'none',
  }));

  const hasNoPrimaryRead = !primaryRead;

  return (
    <View style={[styles.tabBar, { backgroundColor: background, borderTopColor: border, paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const color = isFocused ? primary : muted;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <React.Fragment key={route.key}>
            {index === 1 && (
              <View style={styles.fabWrapper}>
                <Pressable
                  style={[styles.mainButton, { backgroundColor: primary }]}
                  onPress={toggle}
                >
                  <Animated.View style={mainIconStyle}>
                    <PlusIcon size={28} color="#fff" />
                  </Animated.View>
                </Pressable>
              </View>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              {options.tabBarIcon?.({ color: color!, size: 24, focused: isFocused })}
              <Text style={[styles.tabLabel, { color }]}>{options.title ?? route.name}</Text>
            </Pressable>
          </React.Fragment>
        );
      })}

      {/* Portal for backdrop + FAB options + overlays */}
      <Portal name="fab">
        <AnimatedPressable
          style={[styles.backdrop, backdropStyle]}
          onPress={collapse}
        />
        <View
          style={[styles.fabOptionsContainer, { bottom: insets.bottom + 56 + 16 }]}
          pointerEvents="box-none"
        >
          {FAB_OPTIONS.map(({ key, ...option }) => (
            <FabOption
              key={key}
              {...option}
              progress={progress}
              foreground={foreground}
              card={card}
              border={border}
              onPress={
                key === 'write'
                  ? handleWrite
                  : key === 'photo'
                    ? handlePhoto
                    : key === 'audio'
                      ? handleAudio
                      : undefined
              }
              isOpen={isOpen}
            />
          ))}
        </View>
        {isTextScannerOpen && (
          <TextScannerOverlay
            onCaptured={handleTextCaptured}
            onClose={() => setIsTextScannerOpen(false)}
          />
        )}
        {isVoiceIslandOpen && (
          <VoiceIsland
            bookCoverUrl={primaryRead?.coverUrl}
            bookTitle={primaryRead?.title}
            bookAuthor={primaryRead?.authors?.[0]}
            onSave={handleVoiceSave}
            onClose={() => setIsVoiceIslandOpen(false)}
          />
        )}
        <CustomPaywall
          visible={showPaywall}
          onDismiss={() => setShowPaywall(false)}
          onPurchaseSuccess={() => setShowPaywall(false)}
        />
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  fabWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },
  mainButton: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  fabOptionsContainer: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
  },
  optionCircle: {
    position: 'absolute',
    width: OPTION_SIZE,
    height: OPTION_SIZE,
    borderRadius: OPTION_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
