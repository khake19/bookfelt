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
  { value: "finished", label: "Finished" },
];

export default function ChangeStatusSheet({
  sheetId,
  payload,
}: SheetProps<"change-status-sheet">) {
  const { background } = useThemeColors();

  return (
    <ActionSheet
      id={sheetId}
      containerStyle={{ backgroundColor: background }}
    >
      <View className="px-6 pt-2 gap-4">
        <View className="items-center">
          <Text className="text-foreground font-semibold text-lg">
            Change Status
          </Text>
        </View>

        <View className="bg-card rounded-xl overflow-hidden">
          {STATUS_OPTIONS.map((option, index) => {
            const isActive = option.value === payload?.currentStatus;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  payload?.onChangeStatus?.(option.value);
                  SheetManager.hide(sheetId);
                }}
                className={`flex-row items-center justify-between px-5 py-3.5${
                  index > 0 ? " border-t border-border/30" : ""
                }`}
              >
                <Text
                  className={
                    isActive
                      ? "text-primary font-semibold"
                      : "text-foreground"
                  }
                >
                  {option.label}
                </Text>
                {isActive && <CheckIcon size={16} className="text-primary" />}
              </Pressable>
            );
          })}
        </View>
      </View>
    </ActionSheet>
  );
}
