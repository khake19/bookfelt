import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SparklesIcon } from "react-native-heroicons/solid";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useBookSummary } from "@/features/books/hooks/use-book-summary";
import { ScreenWrapper } from "@/shared";
import { useState } from "react";
import { CustomPaywall } from "@/features/premium";

export default function BookSummaryScreen() {
  const { bookId, source } = useLocalSearchParams<{
    bookId: string;
    source: "finished" | "dnf";
  }>();
  const router = useRouter();
  const { state, bookTitle, retry } = useBookSummary(bookId, source);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleDone = () => {
    router.dismissAll();
  };

  const isFinished = source === "finished";

  return (
    <ScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8 flex-grow justify-center"
      >
        <View className="items-center">
          {isFinished && state.kind === "done" && (
            <View className="absolute inset-0 z-10 pointer-events-none">
              <LottieView
                source={require("../assets/confetti.lottie")}
                autoPlay
                loop={false}
                renderMode="SOFTWARE"
                style={{ width: "100%", height: "100%", position: "absolute" }}
              />
            </View>
          )}

          <Animated.View
            entering={FadeInDown.duration(500).delay(300)}
            className="my-6 w-16 h-px bg-primary/20"
          />

          {state.kind === "loading" && (
            <Animated.View
              entering={FadeIn.duration(400)}
              className="items-center"
            >
              <Text className="text-foreground font-serif-italic text-base italic">
                Reflecting on your journey...
              </Text>
              <View className="mt-6 flex-row gap-1.5 items-center">
                <LoadingDot delay={0} />
                <LoadingDot delay={200} />
                <LoadingDot delay={400} />
              </View>
            </Animated.View>
          )}

          {state.kind === "done" && (
            <Animated.View
              entering={FadeIn.duration(600)}
              className="items-center w-full"
            >
              <Text className="text-foreground font-serif-italic text-base italic mb-2">
                {isFinished
                  ? "A journey well traveled."
                  : "Every book teaches us something."}
              </Text>
              <Text className="text-muted text-sm mb-6">{bookTitle}</Text>
              <Text className="text-muted text-sm leading-relaxed text-center px-4">
                {state.text}
              </Text>
              <Pressable
                onPress={handleDone}
                className="mt-8 bg-primary rounded-full px-10 py-3"
              >
                <Text className="text-background text-center font-medium text-base">
                  {isFinished ? "Finish the Book" : "Close the Chapter"}
                </Text>
              </Pressable>
            </Animated.View>
          )}

          {state.kind === "blocked" && (
            <Animated.View
              entering={FadeIn.duration(400)}
              className="items-center w-full px-6"
            >
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                <SparklesIcon size={32} color="#8B5CF6" />
              </View>
              <Text className="text-foreground font-serif-italic text-base italic mb-2">
                {state.reason.includes("entry") || state.reason.includes("entries")
                  ? "More Entries Needed"
                  : "Summary Already Generated"}
              </Text>
              <Text className="text-muted text-sm mb-6 text-center leading-relaxed">
                {state.reason}
              </Text>
              {state.reason.includes("entry") || state.reason.includes("entries") ? (
                <Pressable
                  onPress={handleDone}
                  className="bg-primary rounded-full px-10 py-3"
                >
                  <Text className="text-white text-center font-medium text-base">
                    Continue Writing
                  </Text>
                </Pressable>
              ) : (
                <>
                  <Pressable
                    onPress={() => setShowPaywall(true)}
                    className="bg-primary rounded-full px-10 py-3"
                  >
                    <Text className="text-white text-center font-medium text-base">
                      Upgrade to Premium
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleDone}
                    className="mt-4 items-center py-2"
                  >
                    <Text className="text-muted text-sm">Skip for Now</Text>
                  </Pressable>
                </>
              )}
            </Animated.View>
          )}

          {state.kind === "error" && (
            <Animated.View
              entering={FadeIn.duration(400)}
              className="items-center w-full"
            >
              <Text className="text-foreground font-serif-italic text-base italic mb-2">
                Something went wrong.
              </Text>
              <Text className="text-muted text-sm mb-6 text-center px-6">
                We couldn't generate your summary right now.
              </Text>
              <Pressable
                onPress={retry}
                className="bg-primary rounded-full px-10 py-3"
              >
                <Text className="text-background text-center font-medium text-base">
                  Try Again
                </Text>
              </Pressable>
              <Pressable
                onPress={handleDone}
                className="mt-4 items-center py-2"
              >
                <Text className="text-muted text-sm">Skip</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Paywall Modal */}
      <CustomPaywall
        visible={showPaywall}
        onDismiss={() => setShowPaywall(false)}
        onPurchaseSuccess={() => {
          setShowPaywall(false);
          retry(); // Retry summary generation after upgrade
        }}
      />
    </ScreenWrapper>
  );
}

function LoadingDot({ delay }: { delay: number }) {
  return (
    <Animated.View
      entering={FadeIn.duration(400).delay(delay)}
      className="w-1.5 h-1.5 rounded-full bg-primary/40"
    />
  );
}
