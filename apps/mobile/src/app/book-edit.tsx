import { useEffect, useState } from "react";
import { Button, Input } from "@bookfelt/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useLibrary } from "@/features/books/hooks/use-library";
import {
  bookFormSchema,
  type BookFormValues,
} from "@/features/books/schemas/book-form";
import AudioPlayer from "@/features/entries/components/AudioPlayer";
import { CloseButton, FocusModeOverlay, RichTextPreview, ScreenWrapper } from "@/shared";

const BookEditScreen = () => {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const router = useRouter();
  const { books, updateBook } = useLibrary();
  const book = books.find((b) => b.id === bookId);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isValid },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: book?.title ?? "",
      authors: book?.authors.join(", ") ?? "",
      description: book?.description ?? "",
      firstImpression: book?.firstImpression ?? "",
      finalThought: book?.finalThought ?? "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (book) {
      reset({
        title: book.title,
        authors: book.authors.join(", "),
        description: book.description ?? "",
        firstImpression: book.firstImpression ?? "",
        finalThought: book.finalThought ?? "",
      });
    }
  }, [book, reset]);

  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isFirstImpressionFocusMode, setIsFirstImpressionFocusMode] = useState(false);
  const [isFinalThoughtFocusMode, setIsFinalThoughtFocusMode] = useState(false);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const description = watch("description");
  const firstImpression = watch("firstImpression");
  const finalThought = watch("finalThought");

  const onSubmit = (values: BookFormValues) => {
    updateBook(bookId, {
      title: values.title.trim(),
      authors: values.authors
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      description: values.description.trim() || undefined,
      firstImpression: values.firstImpression.trim() || undefined,
      finalThought: values.finalThought.trim() || undefined,
    });
    router.back();
  };

  if (!book) {
    return (
      <ScreenWrapper>
        <View
          className="flex-row items-center pb-3"
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
        {/* Synopsis - Collapsible */}
        <View className="py-3">
          <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-2">
            Synopsis
          </Text>
          <Pressable
            onPress={() => setIsFocusMode(true)}
            className="bg-card/50 rounded-xl p-3 border border-border"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}
          >
            {description ? (
              <View>
                <View className={!isSynopsisExpanded ? "max-h-[80px] overflow-hidden" : ""}>
                  <RichTextPreview html={description} />
                </View>
                {description.length > 200 && (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      setIsSynopsisExpanded(!isSynopsisExpanded);
                    }}
                    className="mt-2"
                  >
                    <Text className="text-xs text-primary font-medium">
                      {isSynopsisExpanded ? "Show less" : "Read more"}
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <Text className="text-sm text-muted/60 italic">
                Tap to add synopsis
              </Text>
            )}
          </Pressable>
        </View>

        {/* Bookends Section */}
        <View className="pt-4">
          <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-3">
            Bookends
          </Text>

          {/* First Impression Card */}
          <Pressable
            onPress={() => setIsFirstImpressionFocusMode(true)}
            className="bg-card rounded-xl p-4 border border-border mb-3"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}
          >
            <View className="flex-row items-center justify-between mb-2.5">
              <Text className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                First Impression
              </Text>
              {book.firstImpressionAudioUri && (
                <View className="w-2 h-2 rounded-full bg-primary" />
              )}
            </View>
            {firstImpression ? (
              <View>
                <RichTextPreview html={firstImpression} />
                {book.firstImpressionAudioUri && (
                  <View className="pt-3">
                    <AudioPlayer uri={book.firstImpressionAudioUri} />
                  </View>
                )}
              </View>
            ) : (
              <Text className="text-sm text-muted/60 italic">
                What's your first impression?
              </Text>
            )}
          </Pressable>

          {/* Final Thought Card */}
          {book.status === "finished" && (
            <Pressable
              onPress={() => setIsFinalThoughtFocusMode(true)}
              className="bg-card rounded-xl p-4 border border-border"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}
            >
              <View className="flex-row items-center justify-between mb-2.5">
                <Text className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                  Final Thought
                </Text>
                {book.finalThoughtAudioUri && (
                  <View className="w-2 h-2 rounded-full bg-primary" />
                )}
              </View>
              {finalThought ? (
                <View>
                  <RichTextPreview html={finalThought} />
                  {book.finalThoughtAudioUri && (
                    <View className="pt-3">
                      <AudioPlayer uri={book.finalThoughtAudioUri} />
                    </View>
                  )}
                </View>
              ) : (
                <Text className="text-sm text-muted/60 italic">
                  Any final thoughts?
                </Text>
              )}
            </Pressable>
          )}
        </View>
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
      {isFirstImpressionFocusMode && (
        <FocusModeOverlay
          subtitle="First Impression"
          content={firstImpression}
          onChangeContent={(html) => setValue("firstImpression", html)}
          onDone={() => setIsFirstImpressionFocusMode(false)}
          placeholder="What is your first impression?"
        />
      )}
      {isFinalThoughtFocusMode && (
        <FocusModeOverlay
          subtitle="Final Thought"
          content={finalThought}
          onChangeContent={(html) => setValue("finalThought", html)}
          onDone={() => setIsFinalThoughtFocusMode(false)}
          placeholder="Any final thoughts?"
        />
      )}
    </ScreenWrapper>
  );
};

export default BookEditScreen;
