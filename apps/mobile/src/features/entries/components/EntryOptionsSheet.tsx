import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import ActionSheet, {
  SheetManager,
  SheetProps,
} from "react-native-actions-sheet";
import { CheckIcon } from "react-native-heroicons/mini";
import { useThemeColors } from "../../../shared/hooks/use-theme-colors";
import type { ReadingStatus } from "../../books/types/book";

const STATUS_OPTIONS: { value: ReadingStatus; label: string }[] = [
  { value: "reading", label: "Reading" },
  { value: "want-to-read", label: "Want to Read" },
  { value: "finished", label: "Finished" },
];

export default function EntryOptionsSheet({
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
      <View className="px-6 pt-2 gap-2">
        {expanded && (
          <View className="bg-card rounded-xl overflow-hidden">
            {STATUS_OPTIONS.map((option) => {
              const isActive = option.value === payload?.currentStatus;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    payload?.onChangeStatus?.(option.value);
                    SheetManager.hide(sheetId);
                  }}
                  className="flex-row items-center justify-between px-5 py-3"
                >
                  <Text
                    className={
                      isActive
                        ? "text-primary font-semibold text-sm"
                        : "text-foreground text-sm"
                    }
                  >
                    {option.label}
                  </Text>
                  {isActive && <CheckIcon size={16} className="text-primary" />}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Edit */}
        <Pressable
          onPress={() => {
            SheetManager.hide(sheetId);
            payload?.onEdit?.();
          }}
          className="bg-card rounded-xl py-3.5 items-center"
        >
          <Text className="text-foreground font-semibold">Edit</Text>
        </Pressable>

        {/* Delete */}
        <Pressable
          onPress={() => {
            SheetManager.hide(sheetId);
            payload?.onDelete?.();
          }}
          className="bg-destructive rounded-xl py-3.5 items-center"
        >
          <Text className="text-background font-semibold">Delete</Text>
        </Pressable>

        {/* Cancel */}
        <Pressable
          onPress={() => SheetManager.hide(sheetId)}
          className="bg-card rounded-xl py-3.5 items-center"
        >
          <Text className="text-foreground font-semibold">Cancel</Text>
        </Pressable>
      </View>
    </ActionSheet>
  );
}
