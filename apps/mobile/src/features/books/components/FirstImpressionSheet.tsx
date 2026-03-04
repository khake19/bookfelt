import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import ActionSheet, {
  SheetManager,
  SheetProps,
} from "react-native-actions-sheet";
import { useThemeColors } from "../../../shared/hooks/use-theme-colors";

export default function FirstImpressionSheet({
  sheetId,
  payload,
}: SheetProps<"first-impression-sheet">) {
  const { background } = useThemeColors();
  const [text, setText] = useState("");

  return (
    <ActionSheet
      id={sheetId}
      containerStyle={{ backgroundColor: background }}
    >
      <View className="px-6 pt-2 gap-4">
        <Text className="text-foreground font-semibold text-lg text-center">
          What's your first impression?
        </Text>

        <TextInput
          className="text-base text-foreground leading-relaxed min-h-[100px] placeholder:text-muted/50"
          value={text}
          onChangeText={setText}
          placeholder="Hoping for a good cry..."
          multiline
          textAlignVertical="top"
          autoFocus
        />

        <View className="gap-2">
          <Text
            onPress={() => {
              if (text.trim()) {
                payload?.onSave?.(text.trim());
              }
              SheetManager.hide(sheetId);
            }}
            className="bg-primary text-background text-center font-semibold rounded-xl py-3.5 overflow-hidden"
          >
            Save
          </Text>
          <Text
            onPress={() => SheetManager.hide(sheetId)}
            className="bg-card text-foreground text-center font-semibold rounded-xl py-3.5 overflow-hidden"
          >
            Skip
          </Text>
        </View>
      </View>
    </ActionSheet>
  );
}
