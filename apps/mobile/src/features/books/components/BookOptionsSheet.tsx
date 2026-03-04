import { Pressable, Text, View } from "react-native";
import ActionSheet, {
  SheetManager,
  SheetProps,
} from "react-native-actions-sheet";
import { useThemeColors } from "../../../shared/hooks/use-theme-colors";
import { SHEET_IDS } from "../../../shared/sheets";

export default function BookOptionsSheet({
  sheetId,
  payload,
}: SheetProps<"entry-options-sheet">) {
  const { background } = useThemeColors();

  return (
    <ActionSheet
      id={sheetId}
      containerStyle={{ backgroundColor: background }}
    >
      <View className="px-6 pt-2">
        {/* Change Status */}
        <Pressable
          onPress={async () => {
            await SheetManager.hide(sheetId);
            SheetManager.show(SHEET_IDS.CHANGE_STATUS, {
              payload: {
                onChangeStatus: (status) => payload?.onChangeStatus?.(status),
                currentStatus: payload?.currentStatus!,
              },
            });
          }}
          className="bg-card rounded-xl py-3.5 items-center"
        >
          <Text className="text-foreground font-semibold">Change Status</Text>
        </Pressable>

        {/* Edit */}
        <Pressable
          onPress={() => {
            SheetManager.hide(sheetId);
            payload?.onEdit?.();
          }}
          className="bg-card rounded-xl py-3.5 items-center mt-1"
        >
          <Text className="text-foreground font-semibold">Edit</Text>
        </Pressable>

        {/* Delete */}
        <Pressable
          onPress={async () => {
            await SheetManager.hide(sheetId);
            SheetManager.show(SHEET_IDS.DELETE_ENTRY, {
              payload: {
                onConfirm: () => payload?.onDelete?.(),
                title: "Delete book?",
                description: "All reflections for this book will also be removed.",
              },
            });
          }}
          className="bg-destructive rounded-xl py-3.5 items-center mt-4"
        >
          <Text className="text-background font-semibold">Delete</Text>
        </Pressable>
      </View>
    </ActionSheet>
  );
}
