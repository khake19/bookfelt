import { useEffect, useRef, useState } from "react";
import { Button, Textarea } from "@bookfelt/ui";
import { Portal } from "@rn-primitives/portal";
import { Keyboard, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CloseButton } from "../../../shared";

interface FocusModeOverlayProps {
  reflection: string;
  onChangeReflection: (text: string) => void;
  onDone: () => void;
}

const FocusModeOverlay = ({
  reflection,
  onChangeReflection,
  onDone,
}: FocusModeOverlayProps) => {
  const insets = useSafeAreaInsets();
  const [showDone, setShowDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleDone = () => {
    Keyboard.dismiss();
    onDone();
  };

  const handleChangeText = (text: string) => {
    setShowDone(false);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowDone(true), 1500);
    onChangeReflection(text);
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <Portal name="focus-mode">
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        className="absolute inset-0 bg-background"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          <CloseButton onPress={handleDone} />
          {showDone && (
            <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)}>
              <Button shape="pill" onPress={handleDone}>
                <Text className="text-secondary font-medium">Done</Text>
              </Button>
            </Animated.View>
          )}
        </View>
        <Textarea
          className="flex-1 border-0 rounded-none bg-transparent shadow-none px-4 text-base leading-relaxed"
          placeholder="Write what this made you feel.."
          value={reflection}
          onChangeText={handleChangeText}
          autoFocus
        />
      </Animated.View>
    </Portal>
  );
};

export default FocusModeOverlay;
