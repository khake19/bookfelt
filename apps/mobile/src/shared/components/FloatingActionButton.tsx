import { Pressable, StyleSheet, View } from 'react-native';
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
import { useThemeColors } from '../hooks/use-theme-colors';

const SPRING_CONFIG = { damping: 15, stiffness: 180 };
const TAB_BAR_HEIGHT = 49;
const FAB_SIZE = 56;
const OPTION_SIZE = 48;
const OPTION_SPACING = 60;
const RIGHT_OFFSET = 20;

type FabOptionProps = {
  label: string;
  icon: typeof PencilSquareIcon;
  index: number;
  progress: SharedValue<number>;
  foreground: string | undefined;
  card: string | undefined;
  border: string | undefined;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FabOption({ label, icon: Icon, index, progress, foreground, card, border }: FabOptionProps) {
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
    <Animated.View
      style={[styles.optionRow, { bottom: (index + 1) * OPTION_SPACING }, animatedStyle]}
      pointerEvents={progress.value > 0 ? 'auto' : 'none'}
    >
      <Animated.Text style={[styles.optionLabel, { color: foreground }]}>
        {label}
      </Animated.Text>
      <Pressable
        style={[
          styles.optionCircle,
          { backgroundColor: card, borderColor: border },
        ]}
      >
        <Icon size={22} color={foreground} />
      </Pressable>
    </Animated.View>
  );
}

const OPTIONS = [
  { label: 'Write', icon: PencilSquareIcon, index: 0 },
  { label: 'Photo', icon: CameraIcon, index: 1 },
  { label: 'Audio', icon: MicrophoneIcon, index: 2 },
] as const;

export default function FloatingActionButton() {
  const insets = useSafeAreaInsets();
  const { primary, foreground, card, border } = useThemeColors();
  const progress = useSharedValue(0);

  const bottomOffset = TAB_BAR_HEIGHT + insets.bottom + 16;

  const toggle = () => {
    progress.value = withSpring(progress.value > 0.5 ? 0 : 1, SPRING_CONFIG);
  };

  const collapse = () => {
    progress.value = withSpring(0, SPRING_CONFIG);
  };

  const mainIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(progress.value, [0, 1], [0, 45], 'clamp')}deg` }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1], 'clamp'),
    pointerEvents: progress.value > 0.01 ? 'auto' : 'none',
  }));

  return (
    <Portal name="fab">
      <AnimatedPressable
        style={[styles.backdrop, backdropStyle]}
        onPress={collapse}
      />
      <View
        style={[styles.container, { bottom: bottomOffset, right: RIGHT_OFFSET }]}
        pointerEvents="box-none"
      >
        {OPTIONS.map((option) => (
          <FabOption
            key={option.label}
            {...option}
            progress={progress}
            foreground={foreground}
            card={card}
            border={border}
          />
        ))}
        <Pressable
          style={[styles.mainButton, { backgroundColor: primary }]}
          onPress={toggle}
        >
          <Animated.View style={mainIconStyle}>
            <PlusIcon size={28} color="#fff" />
          </Animated.View>
        </Pressable>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  container: {
    position: 'absolute',
    alignItems: 'center',
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
  optionRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    right: (FAB_SIZE - OPTION_SIZE) / 2,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 12,
  },
  optionCircle: {
    width: OPTION_SIZE,
    height: OPTION_SIZE,
    borderRadius: OPTION_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
