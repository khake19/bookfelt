import { Text, View } from "react-native";
import ActionSheet, {
  SheetManager,
  SheetProps,
} from "react-native-actions-sheet";
import { useThemeColors } from "../hooks/use-theme-colors";

export default function DeleteEntrySheet({
  sheetId,
  payload,
}: SheetProps<"delete-entry-sheet">) {
  const { background } = useThemeColors();

  return (
    <ActionSheet
      id={sheetId}
      containerStyle={{ backgroundColor: background }}
    >
      <View className="px-6 pt-2 pb-8 gap-4">
        <View className="gap-1 items-center">
          <Text className="text-foreground font-semibold text-lg">
            Delete reflection?
          </Text>
          <Text className="text-muted text-sm">This can't be undone.</Text>
        </View>

        <View className="gap-2">
          <Text
            onPress={() => {
              payload?.onConfirm?.();
              SheetManager.hide(sheetId);
            }}
            className="bg-destructive text-background text-center font-semibold rounded-xl py-3.5 overflow-hidden"
          >
            Delete
          </Text>
          <Text
            onPress={() => SheetManager.hide(sheetId)}
            className="bg-card text-foreground text-center font-semibold rounded-xl py-3.5 overflow-hidden"
          >
            Cancel
          </Text>
        </View>
      </View>
    </ActionSheet>
  );
}
