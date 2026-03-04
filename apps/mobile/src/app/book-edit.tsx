import { useState } from "react";
import { Button, Input } from "@bookfelt/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLibrary } from "../features/books/hooks/use-library";
import {
  bookFormSchema,
  type BookFormValues,
} from "../features/books/schemas/book-form";
import { CloseButton, FocusModeOverlay, RichTextPreview, ScreenWrapper } from "../shared";

const BookEditScreen = () => {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { books, updateBook } = useLibrary();
  const book = books.find((b) => b.id === bookId);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: book?.title ?? "",
      authors: book?.authors.join(", ") ?? "",
      description: book?.description ?? "",
    },
    mode: "onChange",
  });

  const [isFocusMode, setIsFocusMode] = useState(false);
  const description = watch("description");

  const onSubmit = (values: BookFormValues) => {
    updateBook(bookId, {
      title: values.title.trim(),
      authors: values.authors
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      description: values.description.trim() || undefined,
    });
    router.back();
  };

  if (!book) {
    return (
      <ScreenWrapper>
        <View
          className="flex-row items-center pb-3"
          style={{ paddingTop: insets.top }}
        >
          <CloseButton onPress={() => router.back()} />
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-sm">Book not found</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View
        className="flex-row items-center pb-3"
        style={{ paddingTop: insets.top }}
      >
        <CloseButton onPress={() => router.back()} />
        <View className="flex-1 items-center">
          <Text
            className="text-foreground font-serif font-semibold"
            numberOfLines={1}
          >
            Edit Book
          </Text>
        </View>
        <Button
          shape="pill"
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid}
        >
          <Text className="text-secondary font-medium">Save</Text>
        </Button>
      </View>
      <ScrollView
        className="flex-1 pt-[14px] px-4 pb-6"
        contentContainerClassName="gap-[14px]"
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-1.5">
            Title
          </Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <Input
                className="bg-card border-[1.5px] border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
                value={value}
                onChangeText={onChange}
                placeholder="Book title"
              />
            )}
          />
        </View>
        <View className="h-px bg-border" />
        <View>
          <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-1.5">
            Author(s)
          </Text>
          <Controller
            control={control}
            name="authors"
            render={({ field: { onChange, value } }) => (
              <Input
                className="bg-card border-[1.5px] border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
                value={value}
                onChangeText={onChange}
                placeholder="Comma-separated authors"
              />
            )}
          />
        </View>
        <View className="h-px bg-border" />
        <Pressable onPress={() => setIsFocusMode(true)} className="py-3">
          <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-1.5">
            Synopsis
          </Text>
          {description ? (
            <RichTextPreview html={description} />
          ) : (
            <Text className="text-sm text-muted/60 italic">
              Tap to write a synopsis..
            </Text>
          )}
        </Pressable>
      </ScrollView>
      {isFocusMode && (
        <FocusModeOverlay
          subtitle={book.title}
          content={description}
          onChangeContent={(html) => setValue("description", html)}
          onDone={() => setIsFocusMode(false)}
          placeholder="What is this book about?"
        />
      )}
    </ScreenWrapper>
  );
};

export default BookEditScreen;
