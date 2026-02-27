import { Button, Textarea } from "@bookfelt/ui";
import { Portal } from "@rn-primitives/portal";
import { Keyboard, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  const handleDone = () => {
    Keyboard.dismiss();
    onDone();
  };

  return (
    <Portal name="focus-mode">
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        className="absolute inset-0 bg-[#F7F0E3]"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          <Text className="text-base font-semibold text-foreground">
            Focus Mode
          </Text>
          <Button shape="pill" onPress={handleDone}>
            <Text className="text-secondary font-medium">Done</Text>
          </Button>
        </View>
        <Textarea
          className="flex-1 border-0 rounded-none bg-transparent shadow-none px-4 text-base leading-relaxed"
          placeholder="Write what this made you feel.."
          value={reflection}
          onChangeText={onChangeReflection}
          autoFocus
        />
      </Animated.View>
    </Portal>
  );
};

export default FocusModeOverlay;
