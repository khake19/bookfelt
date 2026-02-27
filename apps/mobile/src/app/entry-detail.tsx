import { useState } from "react";
import { Badge, Button, Input, Textarea } from "@bookfelt/ui";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { ScreenWrapper } from "../shared";

const FEELINGS = [
  { label: "mind-blown", emoji: "🤯" },
  { label: "confused", emoji: "😵" },
  { label: "hopeful", emoji: "🌱" },
  { label: "sad", emoji: "😢" },
  { label: "happy", emoji: "😊" },
  { label: "overwhelmed", emoji: "😰" },
  { label: "serene", emoji: "🧘" },
  { label: "inspired", emoji: "✨" },
  { label: "melancholy", emoji: "🥀" },
] as const;

const EntryDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);

  return (
    <ScreenWrapper>
      <View className="flex-row items-center pt-[34px] pb-3 border-b border-border">
        <Pressable
          onPress={() => router.back()}
          className="w-[30px] h-[30px] rounded-full bg-card items-center justify-center shrink-0"
        >
          <Svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M15 18l-6-6 6-6" />
          </Svg>
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="text-primary text-xs">Camera capture</Text>
          <Text className="text-foreground font-serif font-semibold">
            The Three-Body Problem
          </Text>
        </View>
        <Button shape="pill">
          <Text className="text-secondary font-medium">Save</Text>
        </Button>
      </View>
      <ScrollView
        className="flex-1 pt-[14px] px-4 pb-6"
        contentContainerClassName="gap-[14px]"
      >
        <View>
          <Text className="text-xs font-medium tracking-widest uppercase text-muted mb-1.5">
            Where are you?
          </Text>
          <View className="flex-row gap-2">
            <View className="flex-1 flex-row items-center rounded-lg bg-primary/10 border-[1.5px] border-primary py-2.5 px-3 gap-1.5">
              <Text className="text-xs text-muted">Ch.</Text>
              <Input
                className="flex-1 h-auto w-full border-0 bg-transparent p-0 text-sm leading-tight text-foreground shadow-none placeholder:font-light"
                value="12"
              />
            </View>
            <View className="flex-1 flex-row items-center rounded-lg bg-card border-[1.5px] border-border py-2.5 px-3 gap-1.5">
              <Text className="text-xs text-muted">Pg.</Text>
              <Input
                className="flex-1 h-auto w-full border-0 bg-transparent p-0 text-sm leading-tight medium text-foreground shadow-none placeholder:font-light"
                placeholder="—"
              />
            </View>
            <View className="flex-1 flex-row items-center rounded-lg bg-card border-[1.5px] border-border py-2.5 px-3 gap-1.5">
              <Text className="text-xs text-muted">%</Text>
              <Input
                className="flex-1 h-auto w-full border-0 bg-transparent p-0 text-sm leading-tight text-foreground shadow-none placeholder:font-light"
                placeholder="—"
              />
            </View>
          </View>
        </View>
        <View className="h-px bg-border" />
        <View>
          <Text className="text-xs font-medium tracking-widest text-muted mb-1.5">
            SNIPPET (Optional)
          </Text>
          <View className="bg-background border-l-[3px] border-foreground rounded-r-lg py-[9px] px-[11px] font-serif-italic text-xs text-foreground leading-[1.6]">
            <Text className="italic">
              "The universe is a dark forest. Every civilization is an armed
              hunter stalking through the trees..."
            </Text>
          </View>
        </View>
        <View className="h-px bg-border" />
        <View>
          <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-1.5">
            How Does it feel?
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {FEELINGS.map((feeling) => {
              const isSelected = selectedFeeling === feeling.label;
              return (
                <Pressable
                  key={feeling.label}
                  onPress={() =>
                    setSelectedFeeling(isSelected ? null : feeling.label)
                  }
                  className={`flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 ${isSelected ? "bg-primary border-transparent" : "bg-secondary border-border"}`}
                >
                  <Text>{feeling.emoji}</Text>
                  <Text
                    className={`text-xs font-medium ${isSelected ? "text-primary-foreground" : "text-foreground"}`}
                  >
                    {feeling.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View className="h-px bg-border" />
        <View>
          <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-1.5">
            Your Reflection
          </Text>
          <Textarea placeholder="Tap to write what this made you feel.." className="min-h-[120px] max-w-md" />
          <Text className="text-xs text-muted text-right mt-1">
            tap to enter focus mode ↑
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default EntryDetailScreen;
