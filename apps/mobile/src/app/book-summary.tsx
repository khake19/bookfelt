import { generateBookSummary } from "@bookfelt/core";
import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useLibrary } from "../features/books/hooks/use-library";
import { useEntries } from "../features/entries";
import { ScreenWrapper } from "../shared";

type SummaryState =
  | { kind: "loading" }
  | { kind: "done"; text: string }
  | { kind: "error" };

export default function BookSummaryScreen() {
  const { bookId, source } = useLocalSearchParams<{
    bookId: string;
    source: "finished" | "dnf";
  }>();
  const router = useRouter();
  const { books, updateBook } = useLibrary();
  const { entries } = useEntries(bookId);
  const book = books.find((b) => b.id === bookId);
  const abortRef = useRef<AbortController | null>(null);

  const [state, setState] = useState<SummaryState>({ kind: "loading" });

  const fetchSummary = async () => {
    if (!book) return;
    setState({ kind: "loading" });

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const text = await generateBookSummary(
        {
          title: book.title,
          authors: book.authors,
          source,
          firstImpression: book.firstImpression,
          finalThought: book.finalThought,
          exitNote: book.exitNote,
          entries: entries.map((e) => ({
            snippet: e.snippet,
            reflection: e.reflection,
            feeling: e.feeling,
          })),
        },
        controller.signal,
      );

      updateBook(bookId, { summary: text });
      setState({ kind: "done", text });
    } catch (err: any) {
      if (
        err?.name === "AbortError" ||
        err?.name === "CanceledError" ||
        err?.message === "canceled"
      )
        return;
      console.error("Summary generation failed:", {
        message: err?.message,
        code: err?.code,
        status: err?.response?.status,
        data: err?.response?.data,
        config: { url: err?.config?.url, baseURL: err?.config?.baseURL },
      });
      setState({ kind: "error" });
    }
  };

  useEffect(() => {
    fetchSummary();
    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDone = () => {
    router.dismissAll();
  };

  const isFinished = source === "finished";

  if (!book) {
    return (
      <ScreenWrapper>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-sm">Book not found</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8 flex-grow justify-center"
      >
        <View className="items-center">
          {/* Confetti overlay for finished books */}
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
          {/* Divider */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(300)}
            className="my-6 w-16 h-px bg-primary/20"
          />

          {/* Loading state */}
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

          {/* Done state */}
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
              <Text className="text-muted text-sm mb-6">{book.title}</Text>

              {/* Summary text */}
              <Text className="text-muted text-sm leading-relaxed text-center px-4">
                {state.text}
              </Text>

              {/* Done button */}
              <Pressable
                onPress={handleDone}
                className="mt-8 bg-primary rounded-full px-10 py-3"
              >
                <Text className="text-background text-center font-medium text-base">
                  Done
                </Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Error state */}
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
                onPress={fetchSummary}
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
