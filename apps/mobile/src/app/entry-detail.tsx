import { useState } from "react";
import { Button, Input } from "@bookfelt/ui";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { EMOTIONS, FocusModeOverlay, RichTextPreview } from "../features/entries";
import { CloseButton, ScreenWrapper } from "../shared";

const EntryDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");
  const [isFocusMode, setIsFocusMode] = useState(false);

  return (
    <ScreenWrapper>
      <View className="flex-row items-center pt-[34px] pb-3 border-b border-border">
        <CloseButton onPress={() => router.back()} />
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
            SNIPPET
          </Text>
          <View className="border-l-2 border-foreground/20 rounded-l pl-3">
            <Text className="text-sm italic text-foreground/70 font-serif-italic leading-relaxed">
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
            {EMOTIONS.map((emotion) => {
              const isSelected = selectedFeeling === emotion.label;
              return (
                <Pressable
                  key={emotion.label}
                  onPress={() =>
                    setSelectedFeeling(isSelected ? null : emotion.label)
                  }
                  className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${isSelected ? "" : "bg-secondary border border-border"}`}
                  style={isSelected ? { backgroundColor: emotion.color + "30" } : undefined}
                >
                  <Text>{emotion.emoji}</Text>
                  <Text
                    className={`text-xs font-medium ${isSelected ? "" : "text-foreground"}`}
                    style={isSelected ? { color: emotion.color } : undefined}
                  >
                    {emotion.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View className="h-px bg-border" />
        <Pressable
          onPress={() => setIsFocusMode(true)}
          className="py-3"
        >
          <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-1.5">
            Your Reflection
          </Text>
          {reflection ? (
            <RichTextPreview html={reflection} />
          ) : (
            <Text className="text-sm text-muted/60 italic">
              Tap to write what this made you feel..
            </Text>
          )}
        </Pressable>
      </ScrollView>
      {isFocusMode && <FocusModeOverlay snippet={`\u201CThe universe is a dark forest. Every civilization is an armed hunter stalking through the trees...\u201D`} reflection={reflection} onChangeReflection={setReflection} onDone={() => setIsFocusMode(false)} />}
    </ScreenWrapper>
  );
};

export default EntryDetailScreen;
