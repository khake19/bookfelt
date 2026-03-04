import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import ActionSheet, {
  SheetManager,
  SheetProps,
} from "react-native-actions-sheet";
import { CheckIcon } from "react-native-heroicons/mini";
import { useThemeColors } from "../hooks/use-theme-colors";
import type { ReadingStatus } from "../../features/books/types/book";

const STATUS_OPTIONS: { value: ReadingStatus; label: string }[] = [
  { value: "reading", label: "Reading" },
  { value: "want-to-read", label: "Want to Read" },
  { value: "finished", label: "Finished" },
];

export default function BookOptionsSheet({
  sheetId,
  payload,
}: SheetProps<"entry-options-sheet">) {
  const { background } = useThemeColors();
  const [expanded, setExpanded] = useState(false);

  return (
    <ActionSheet
      id={sheetId}
      containerStyle={{ backgroundColor: background }}
      onClose={() => setExpanded(false)}
    >
      <View className="px-6 pt-2">
        {/* Change Status */}
        <View className="bg-card rounded-xl overflow-hidden">
          <Pressable
            onPress={() => setExpanded((prev) => !prev)}
            className="py-3.5 items-center"
          >
            <Text className="text-foreground font-semibold">Change Status</Text>
          </Pressable>

        </View>

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
            SheetManager.show("delete-entry-sheet", {
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
