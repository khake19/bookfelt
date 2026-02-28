import { useState } from "react";
import { Button, Input } from "@bookfelt/ui";
import { Portal } from "@rn-primitives/portal";
import { Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CloseButton } from "../../../shared";
import type { Book } from "../types/book";

interface ManualBookFormProps {
  initialTitle?: string;
  onSubmit: (book: Book) => void;
  onClose: () => void;
}

const ManualBookForm = ({
  initialTitle = "",
  onSubmit,
  onClose,
}: ManualBookFormProps) => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState(initialTitle);
  const [author, setAuthor] = useState("");

  const canSubmit = title.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const book: Book = {
      id: `manual-${Date.now()}`,
      title: title.trim(),
      authors: author.trim() ? [author.trim()] : ["Unknown author"],
      source: "manual",
    };
    onSubmit(book);
  };

  return (
    <Portal name="manual-book-form">
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        className="absolute inset-0 bg-background"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          <CloseButton onPress={onClose} />
          <Text className="text-foreground font-mono-bold text-sm">
            Add book
          </Text>
          <View className="w-[30px]" />
        </View>

        <View className="px-4 gap-5 mt-4">
          <View>
            <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-1.5">
              Title
            </Text>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder="Book title"
              autoFocus
              className="bg-card border-border"
            />
          </View>
          <View>
            <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-1.5">
              Author
            </Text>
            <Input
              value={author}
              onChangeText={setAuthor}
              placeholder="Author name (optional)"
              className="bg-card border-border"
            />
          </View>
          <Button
            onPress={handleSubmit}
            disabled={!canSubmit}
            shape="pill"
            className="mt-2"
          >
            <Text className="text-primary-foreground font-medium">
              Add to library
            </Text>
          </Button>
        </View>
      </Animated.View>
    </Portal>
  );
};

export default ManualBookForm;
