import { useState } from "react";
import { Button, Input } from "@bookfelt/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, Text, View } from "react-native";
import { EMOTIONS, FocusModeOverlay, RichTextPreview, useEntries } from "../features/entries";
import { entryFormSchema, type EntryFormValues } from "../features/entries/schemas/entry-form";
import { useLibrary } from "../features/books/hooks/use-library";
import { CloseButton, ScreenWrapper } from "../shared";

const EntryDetailScreen = () => {
  const { id, bookId } = useLocalSearchParams<{ id: string; bookId?: string }>();
  const router = useRouter();
  const { books } = useLibrary();
  const { entries, addEntry, updateEntry } = useEntries();
  const existing = id ? entries.find((e) => e.id === id) : undefined;
  const book = books.find((b) => b.id === bookId) ?? books.find((b) => b.status === "reading");
  const isNew = !existing;

  const { control, handleSubmit, watch, setValue, formState: { isValid } } = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: {
      chapter: existing?.chapter ?? "",
      page: existing?.page ?? "",
      percent: existing?.percent ?? "",
      snippet: existing?.snippet ?? "",
      feeling: existing?.feeling ?? "",
      reflection: existing?.reflection ?? "",
      date: existing ? new Date(existing.date) : new Date(),
    },
    mode: "onChange",
  });

  const [isFocusMode, setIsFocusMode] = useState(false);

  const numericOnly = (v: string) => v.replace(/[^0-9]/g, "");

  const canSave = isValid && book != null;

  const onSubmit = (values: EntryFormValues) => {
    if (!book) return;
    const data = {
      bookId: book.id,
      bookTitle: book.title,
      chapter: values.chapter || undefined,
      page: values.page || undefined,
      percent: values.percent || undefined,
      snippet: values.snippet.trim(),
      feeling: values.feeling || undefined,
      reflection: values.reflection || undefined,
      date: values.date.getTime(),
    };
    if (isNew) {
      addEntry(data);
    } else {
      updateEntry(existing.id, data);
    }
    router.back();
  };

  const selectedFeeling = watch("feeling");
  const snippet = watch("snippet");
  const reflection = watch("reflection");

  return (
    <ScreenWrapper>
      <View className="flex-row items-center pt-[34px] pb-3 border-b border-border">
        <CloseButton onPress={() => router.back()} />
        <View className="flex-1 items-center">
          <Text className="text-foreground font-serif font-semibold" numberOfLines={1}>
            {book?.title ?? "No book selected"}
          </Text>
        </View>
        <Button shape="pill" onPress={handleSubmit(onSubmit)} disabled={!canSave}>
          <Text className="text-secondary font-medium">Save</Text>
        </Button>
      </View>
      <ScrollView
        className="flex-1 pt-[14px] px-4 pb-6"
        contentContainerClassName="gap-[14px]"
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text className="text-xs font-medium tracking-widest uppercase text-muted mb-1.5">
            Where are you?
          </Text>
          <View className="flex-row gap-2">
            <Controller
              control={control}
              name="chapter"
              render={({ field: { onChange, value } }) => (
                <View className={`flex-1 flex-row items-center rounded-lg py-2.5 px-3 gap-1.5 ${value ? "bg-primary/10 border-[1.5px] border-primary" : "bg-card border-[1.5px] border-border"}`}>
                  <Text className="text-xs text-muted">Ch.</Text>
                  <Input
                    className="flex-1 h-auto w-full border-0 bg-transparent p-0 text-sm leading-tight text-foreground shadow-none placeholder:font-light"
                    value={value}
                    onChangeText={(v) => onChange(numericOnly(v))}
                    placeholder="—"
                    keyboardType="number-pad"
                  />
                </View>
              )}
            />
            <Controller
              control={control}
              name="page"
              render={({ field: { onChange, value } }) => (
                <View className={`flex-1 flex-row items-center rounded-lg py-2.5 px-3 gap-1.5 ${value ? "bg-primary/10 border-[1.5px] border-primary" : "bg-card border-[1.5px] border-border"}`}>
                  <Text className="text-xs text-muted">Pg.</Text>
                  <Input
                    className="flex-1 h-auto w-full border-0 bg-transparent p-0 text-sm leading-tight text-foreground shadow-none placeholder:font-light"
                    value={value}
                    onChangeText={(v) => onChange(numericOnly(v))}
                    placeholder="—"
                    keyboardType="number-pad"
                  />
                </View>
              )}
            />
            <Controller
              control={control}
              name="percent"
              render={({ field: { onChange, value } }) => (
                <View className={`flex-1 flex-row items-center rounded-lg py-2.5 px-3 gap-1.5 ${value ? "bg-primary/10 border-[1.5px] border-primary" : "bg-card border-[1.5px] border-border"}`}>
                  <Text className="text-xs text-muted">%</Text>
                  <Input
                    className="flex-1 h-auto w-full border-0 bg-transparent p-0 text-sm leading-tight text-foreground shadow-none placeholder:font-light"
                    value={value}
                    onChangeText={(v) => onChange(numericOnly(v))}
                    placeholder="—"
                    keyboardType="number-pad"
                  />
                </View>
              )}
            />
          </View>
        </View>
        <View className="h-px bg-border" />
        <View>
          <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-1.5">
            When
          </Text>
          <View className="flex-row items-center">
            <Controller
              control={control}
              name="date"
              render={({ field: { onChange, value } }) => (
                <DateTimePicker
                  value={value}
                  mode="datetime"
                  display="compact"
                  maximumDate={new Date()}
                  onChange={(_, selected) => {
                    if (selected) onChange(selected);
                  }}
                  accentColor="gray"
                  style={{ marginLeft: -10, transform: [{ scale: 0.85 }], transformOrigin: "left" }}
                />
              )}
            />
          </View>
        </View>
        <View className="h-px bg-border" />
        <View>
          <Text className="text-xs font-medium tracking-widest text-muted mb-1.5">
            SNIPPET
          </Text>
          <View className="border-l-2 border-foreground/20 rounded-l pl-3">
            <Controller
              control={control}
              name="snippet"
              render={({ field: { onChange, value } }) => (
                <Input
                  className="h-auto w-full border-0 bg-transparent p-0 text-sm leading-relaxed text-foreground/70 font-serif-italic shadow-none placeholder:font-light"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Paste or type a passage that resonated..."
                  multiline
                  numberOfLines={4}
                  style={{ minHeight: 80, textAlignVertical: "top" }}
                />
              )}
            />
          </View>
        </View>
        <View className="h-px bg-border" />
        <View>
          <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-1.5">
            How Does it feel?
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {EMOTIONS.map((emotion) => {
              const isSelected = selectedFeeling === emotion.label;
              return (
                <Pressable
                  key={emotion.label}
                  onPress={() =>
                    setValue("feeling", isSelected ? "" : emotion.label, { shouldValidate: true })
                  }
                  className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${isSelected ? "" : "bg-secondary border border-border"}`}
                  style={isSelected ? { backgroundColor: emotion.color + "30" } : undefined}
                >
                  <Text>{emotion.emoji}</Text>
                  <Text
                    className={`text-xs font-medium ${isSelected ? "" : "text-foreground"}`}
                    style={isSelected ? { color: emotion.color } : undefined}
                  >
                    {emotion.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View className="h-px bg-border" />
        <Pressable
          onPress={() => setIsFocusMode(true)}
          className="py-3"
        >
          <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-1.5">
            Your Reflection
          </Text>
          {reflection ? (
            <RichTextPreview html={reflection} />
          ) : (
            <Text className="text-sm text-muted/60 italic">
              Tap to write what this made you feel..
            </Text>
          )}
        </Pressable>
      </ScrollView>
      {isFocusMode && <FocusModeOverlay snippet={snippet ? `\u201C${snippet}\u201D` : ""} reflection={reflection} onChangeReflection={(html) => setValue("reflection", html)} onDone={() => setIsFocusMode(false)} />}
    </ScreenWrapper>
  );
};

export default EntryDetailScreen;
