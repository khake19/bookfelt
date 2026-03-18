import { Pressable, Text } from 'react-native';
import { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface EmotionalArcPointProps {
  x: number;
  y: number;
  color: string;
  emoji: string;
  label: string;
  onPress: () => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function EmotionalArcPoint({
  x,
  y,
  color,
  emoji,
  label,
  onPress,
}: EmotionalArcPointProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(1.3, {
      damping: 10,
      stiffness: 200,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 200,
    });
  };

  return (
    <>
      <Circle
        cx={x}
        cy={y}
        r={6}
        fill={color}
        opacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      />
      <Circle
        cx={x}
        cy={y}
        r={8}
        fill="transparent"
        stroke={color}
        strokeWidth={2}
        opacity={0.4}
      />
    </>
  );
}
