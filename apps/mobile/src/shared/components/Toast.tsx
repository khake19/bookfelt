import { useEffect, useRef } from 'react';
import { Text } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore } from '@/shared/stores/toast.store';

const AUTO_DISMISS_MS = 3000;
const ISLAND_BG = 'hsl(20, 25%, 12%)';

export default function Toast() {
  const insets = useSafeAreaInsets();
  const { visible, message, type, hide } = useToastStore();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!visible) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(hide, AUTO_DISMISS_MS);
    return () => clearTimeout(timerRef.current);
  }, [visible, hide]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      exiting={FadeOutDown.duration(200)}
      style={{
        position: 'absolute',
        bottom: insets.bottom + 80,
        left: 24,
        right: 24,
        backgroundColor: ISLAND_BG,
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
      }}
    >
      <Text
        style={{ color: type === 'error' ? '#f87171' : 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '500' }}
        numberOfLines={2}
      >
        {message}
      </Text>
    </Animated.View>
  );
}
