import { Button, Input } from "@bookfelt/ui";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import ActionSheet, {
  SheetManager,
  SheetProps,
} from "react-native-actions-sheet";
import { useThemeColors } from "@/shared/hooks/use-theme-colors";

const PRESETS = [
  "Coffee shop",
  "In bed",
  "On the train",
  "Lunch break",
  "Late night",
  "Rainy day",
  "Library",
  "Commute home",
  "Traveling",
  "Half-asleep",
  "Quiet morning",
  "Outdoors",
];

export default function SettingSheet({
  sheetId,
  payload,
}: SheetProps<"setting-sheet">) {
  const { background } = useThemeColors();
  const [selected, setSelected] = useState(
    payload?.current && PRESETS.includes(payload.current)
      ? payload.current
      : "",
  );
  const [custom, setCustom] = useState(
    payload?.current && !PRESETS.includes(payload.current)
      ? payload.current
      : "",
  );

  const value = custom.trim() || selected;

  const handleChipPress = (preset: string) => {
    setCustom("");
    setSelected((prev) => (prev === preset ? "" : preset));
  };

  const handleDone = async () => {
    payload?.onSelect(value);
    await SheetManager.hide(sheetId);
  };

  return (
    <ActionSheet
      id={sheetId}
      containerStyle={{ backgroundColor: background }}
    >
      <View className="px-6 pt-2 pb-4 gap-5">
        <View className="items-center">
          <Text className="text-foreground font-semibold text-lg">
            Setting
          </Text>
          <Text className="text-muted text-xs mt-1">
            Set the scene
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          {PRESETS.map((preset) => {
            const isSelected = selected === preset && !custom.trim();
            return (
              <Pressable
                key={preset}
                onPress={() => handleChipPress(preset)}
                className={`rounded-full px-3 py-1.5 ${
                  isSelected
                    ? "bg-primary/15 border border-primary"
                    : "bg-secondary border border-border"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}
                >
                  {preset}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Input
          value={custom}
          onChangeText={(text) => {
            setCustom(text);
            if (text.trim()) setSelected("");
          }}
          placeholder="Or describe the moment..."
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
        />

        <Button
          shape="pill"
          onPress={handleDone}
        >
          <Text className="text-secondary font-medium">Done</Text>
        </Button>
      </View>
    </ActionSheet>
  );
}
