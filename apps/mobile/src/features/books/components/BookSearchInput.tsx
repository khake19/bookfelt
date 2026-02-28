import { Input } from "@bookfelt/ui";
import Feather from "@expo/vector-icons/Feather";
import { Pressable, View } from "react-native";

interface BookSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

const BookSearchInput = ({
  value,
  onChangeText,
  onClear,
}: BookSearchInputProps) => {
  return (
    <View className="flex-row items-center rounded-xl bg-card border-border px-3 gap-2">
      <Feather name="search" size={18} className="text-muted" />
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
          <Feather name="x" size={16} className="text-muted" />
        </Pressable>
      )}
    </View>
  );
};
export default BookSearchInput;
