import { Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

function LoadingDot({ delay }: { delay: number }) {
  return (
    <Animated.View
      entering={FadeIn.duration(400).delay(delay)}
      className="w-1.5 h-1.5 rounded-full bg-primary/40"
    />
  );
}

export default function TranscribingIndicator() {
  return (
    <View className="flex-row items-center gap-2">
      <Text className="text-sm text-muted/60 italic">Transcribing</Text>
      <View className="flex-row gap-1 pt-0.5">
        <LoadingDot delay={0} />
        <LoadingDot delay={200} />
        <LoadingDot delay={400} />
      </View>
    </View>
  );
}
