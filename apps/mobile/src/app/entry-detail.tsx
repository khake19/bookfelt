import { useEffect, useState } from "react";
import { Button, Input } from "@bookfelt/ui";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller } from "react-hook-form";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { EMOTIONS, useEntries, useEntryForm } from "../features/entries";
import type { EntryFormValues } from "../features/entries";
import { useLibrary } from "../features/books/hooks/use-library";
import {
  CloseButton,
  FocusModeOverlay,
  RichTextPreview,
  ScreenWrapper,
  stripHtml,
} from "../shared";
import {
  consumePendingSnippet,
  consumePendingReflection,
} from "../shared/components/FloatingActionButton";
import { CameraIcon } from "react-native-heroicons/outline";
import TextScannerOverlay from "../features/entries/components/TextScannerOverlay";
import AudioPlayer from "../features/entries/components/AudioPlayer";

const EntryDetailScreen = () => {
  const { id, bookId } = useLocalSearchParams<{
    id: string;
    bookId?: string;
  }>();
  const router = useRouter();
  const { books, primaryRead } = useLibrary();
  const { entries, addEntry, updateEntry } = useEntries();
  const existing = id ? entries.find((e) => e.id === id) : undefined;
  const book = books.find((b) => b.id === bookId) ?? primaryRead;
  const isNew = !existing;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid },
  } = useEntryForm(existing);

  const [audioUri, setAudioUri] = useState<string | undefined>(
    existing?.audioUri
  );

  useEffect(() => {
    const pending = consumePendingSnippet();
    if (pending) {
      setValue("snippet", pending);
    }
    const pendingReflection = consumePendingReflection();
    if (pendingReflection) {
      setValue("reflection", pendingReflection.transcription);
      setAudioUri(pendingReflection.audioUri);
    }
  }, [setValue]);

  const [focusTarget, setFocusTarget] = useState<"snippet" | "reflection" | null>(null);
  const [isTextScannerOpen, setIsTextScannerOpen] = useState(false);
  const [androidPickerMode, setAndroidPickerMode] = useState<
    "date" | "time" | null
  >(null);

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
      snippet: values.snippet.trim() || undefined,
      feeling: values.feeling || undefined,
      reflection: values.reflection || undefined,
      audioUri,
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
      <View className="flex-row items-center pb-3">
        <CloseButton onPress={() => router.back()} />
        <View className="flex-1 items-center">
          <Text
            className="text-foreground font-serif font-semibold"
            numberOfLines={1}
          >
            {book?.title ?? "No book selected"}
          </Text>
        </View>
        <Button
          shape="pill"
          onPress={handleSubmit(onSubmit)}
          disabled={!canSave}
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
          <Text className="text-xs font-medium tracking-widest uppercase text-muted mb-1.5">
            Where are you?
          </Text>
          <View className="flex-row gap-2">
            <Controller
              control={control}
              name="chapter"
              render={({ field: { onChange, value } }) => (
                <View
                  className={`flex-1 flex-row items-center rounded-lg py-2.5 px-3 gap-1.5 ${value ? "bg-primary/10 border-[1.5px] border-primary" : "bg-card border-[1.5px] border-border"}`}
                >
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
                <View
                  className={`flex-1 flex-row items-center rounded-lg py-2.5 px-3 gap-1.5 ${value ? "bg-primary/10 border-[1.5px] border-primary" : "bg-card border-[1.5px] border-border"}`}
                >
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
                <View
                  className={`flex-1 flex-row items-center rounded-lg py-2.5 px-3 gap-1.5 ${value ? "bg-primary/10 border-[1.5px] border-primary" : "bg-card border-[1.5px] border-border"}`}
                >
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
              render={({ field: { onChange, value } }) =>
                Platform.OS === "android" ? (
                  <View className="flex-row items-center gap-3">
                    <Pressable onPress={() => setAndroidPickerMode("date")}>
                      <Text className="text-sm text-foreground">
                        {value.toLocaleDateString()}
                      </Text>
                    </Pressable>
                    <Text className="text-muted/40 text-xs">·</Text>
                    <Pressable onPress={() => setAndroidPickerMode("time")}>
                      <Text className="text-sm text-foreground">
                        {value.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </Pressable>
                    {androidPickerMode && (
                      <DateTimePicker
                        value={value}
                        mode={androidPickerMode}
                        display="default"
                        maximumDate={new Date()}
                        onChange={(_, selected) => {
                          setAndroidPickerMode(null);
                          if (selected) onChange(selected);
                        }}
                      />
                    )}
                  </View>
                ) : (
                  <DateTimePicker
                    value={value}
                    mode="datetime"
                    display="compact"
                    maximumDate={new Date()}
                    onChange={(_, selected) => {
                      if (selected) onChange(selected);
                    }}
                    accentColor="gray"
                    style={{
                      marginLeft: -10,
                      transform: [{ scale: 0.85 }],
                      transformOrigin: "left",
                    }}
                  />
                )
              }
            />
          </View>
        </View>
        <View className="h-px bg-border" />
        <View className="py-1">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-xs font-medium tracking-widest text-muted">
              SNIPPET
            </Text>
            <Pressable
              onPress={() => setIsTextScannerOpen(true)}
              hitSlop={8}
              className="p-1"
            >
              <CameraIcon size={18} className="text-muted" />
            </Pressable>
          </View>
          <Pressable onPress={() => setFocusTarget("snippet")}>
            {snippet ? (
              <View className="border-l-2 border-foreground/20 rounded-l pl-3">
                <RichTextPreview html={snippet} />
              </View>
            ) : (
              <Text className="text-sm text-muted/60 italic">
                Tap to write a passage that resonated...
              </Text>
            )}
          </Pressable>
        </View>
        <View className="h-px bg-border" />
        <View>
          <Text className="text-xs font-medium uppercase tracking-widest text-accent mb-1.5">
            How Does it feel?
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {EMOTIONS.map((emotion) => {
              const isSelected = selectedFeeling === emotion.label;
              return (
                <Pressable
                  key={emotion.label}
                  onPress={() =>
                    setValue("feeling", isSelected ? "" : emotion.label, {
                      shouldValidate: true,
                    })
                  }
                  className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${isSelected ? "" : "bg-secondary border border-border"}`}
                  style={
                    isSelected
                      ? { backgroundColor: emotion.color + "30" }
                      : undefined
                  }
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
        <Pressable onPress={() => setFocusTarget("reflection")} className="py-3">
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
        {audioUri && (
          <View className="pb-3">
            <AudioPlayer uri={audioUri} />
          </View>
        )}
      </ScrollView>
      {focusTarget === "snippet" && (
        <FocusModeOverlay
          content={snippet}
          onChangeContent={(html) => setValue("snippet", html)}
          onDone={() => setFocusTarget(null)}
          placeholder="Paste or type a passage that resonated..."
        />
      )}
      {focusTarget === "reflection" && (
        <FocusModeOverlay
          subtitle={snippet ? `\u201C${stripHtml(snippet)}\u201D` : ""}
          content={reflection}
          onChangeContent={(html) => setValue("reflection", html)}
          onDone={() => setFocusTarget(null)}
          placeholder="Write what this made you feel.."
        />
      )}
      {isTextScannerOpen && (
        <TextScannerOverlay
          onCaptured={(text) => {
            setValue("snippet", text);
            setIsTextScannerOpen(false);
          }}
          onClose={() => setIsTextScannerOpen(false)}
        />
      )}
    </ScreenWrapper>
  );
};

export default EntryDetailScreen;
