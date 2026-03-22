import { Input } from "@bookfelt/ui";
import { Pressable, View } from "react-native";
import {
  MagnifyingGlassIcon,
  ViewfinderCircleIcon,
  XMarkIcon,
} from "react-native-heroicons/outline";
import { useThemeColors } from "@/shared";

interface BookSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onScanPress?: () => void;
}

const BookSearchInput = ({
  value,
  onChangeText,
  onClear,
  onScanPress,
}: BookSearchInputProps) => {
  const { muted, primary } = useThemeColors();

  return (
    <View className="flex-row items-center rounded-xl bg-card border border-border px-3 gap-2">
      <MagnifyingGlassIcon size={18} color={muted} />
      <Input
        className="flex-1 h-11 border-0 bg-transparent p-0 text-sm text-foreground shadow-none"
        placeholder="Search by title or author..."
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={onClear} hitSlop={8}>
          <XMarkIcon size={16} color={muted} />
        </Pressable>
      )}
      {onScanPress && (
        <Pressable onPress={onScanPress} hitSlop={8}>
          <ViewfinderCircleIcon size={20} color={primary} />
        </Pressable>
      )}
    </View>
  );
};
export default BookSearchInput;
