import { Button, Input } from "@bookfelt/ui";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { Controller } from "react-hook-form";
import { Platform, Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from "react-native-reanimated";
import { CameraIcon, BookOpenIcon, MicrophoneIcon, TrashIcon } from "react-native-heroicons/outline";
import { SheetManager } from "react-native-actions-sheet";
import { SHEET_IDS } from "@/shared/constants/sheet-ids";
import { useLibrary } from "@/features/books/hooks/use-library";
import type { EntryFormValues } from "@/features/entries";
import { useObserveEmotions, useEntries, useEntryForm } from "@/features/entries";
import AudioPlayer from "@/features/entries/components/AudioPlayer";
import TextScannerOverlay from "@/features/entries/components/TextScannerOverlay";
import VoiceIsland from "@/features/entries/components/VoiceIsland";
import {
  CloseButton,
  FocusModeOverlay,
  RichTextPreview,
  ScreenWrapper,
  TranscribingIndicator,
  stripHtml,
  useThemeColors,
} from "@/shared";
import { consumePendingSnippet } from "@/shared/utils/pending-state";
import { useTranscriptionStore } from "@/shared/stores/transcription.store";
import { deleteAudioFiles } from "@/lib/audio-sync";
import { useBookLimits, CustomPaywall, UpgradePrompts } from "@/features/premium";

const EntryDetailScreen = () => {
  const { mutedForeground, destructive, primary } = useThemeColors();
  const { id, bookId } = useLocalSearchParams<{
    id: string;
    bookId?: string;
  }>();
  const router = useRouter();
  const { books, primaryRead } = useLibrary();
  const { entries, addEntry, updateEntry, removeEntry } = useEntries();
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

  const [reflectionUri, setReflectionUri] = useState<string | undefined>(
    existing?.reflectionUri,
  );
  const hasUserDeletedAudio = useRef(false);
  const audioToDeleteOnSave = useRef<string | null>(null);

  // Sync reflectionUri when existing entry loads (observer emits after mount)
  // But don't override if user has manually deleted the audio
  useEffect(() => {
    if (existing?.reflectionUri && !reflectionUri && !hasUserDeletedAudio.current) {
      setReflectionUri(existing.reflectionUri);
    }
  }, [existing?.reflectionUri]);

  // Reset the deletion flag when switching to a different entry
  useEffect(() => {
    hasUserDeletedAudio.current = false;
    audioToDeleteOnSave.current = null;
  }, [id]);

  useEffect(() => {
    const pending = consumePendingSnippet();
    if (pending) {
      setValue("snippet", pending);
    }
  }, [setValue]);

  const transcriptionStatus = useTranscriptionStore((s) => s.status);
  const transcriptionText = useTranscriptionStore((s) => s.text);
  const startTranscription = useTranscriptionStore((s) => s.startTranscription);
  const registerEntryId = useTranscriptionStore((s) => s.registerEntryId);
  const resetTranscription = useTranscriptionStore((s) => s.reset);

  useEffect(() => {
    if (transcriptionStatus === "completed" && transcriptionText) {
      setValue("reflection", transcriptionText);
    }
  }, [transcriptionStatus, transcriptionText, setValue]);

  useEffect(() => {
    return () => resetTranscription();
  }, []);

  const [focusTarget, setFocusTarget] = useState<
    "snippet" | "reflection" | null
  >(null);
  const [isTextScannerOpen, setIsTextScannerOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [showMoreEmotions, setShowMoreEmotions] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const { limits } = useBookLimits(book?.id);

  const handleVoicePress = () => {
    if (!limits.audioTranscriptions.canUse) {
      UpgradePrompts.audioTranscriptionLimit(() => setShowPaywall(true));
      return;
    }
    setIsVoiceOpen(true);
  };
  const [androidPickerMode, setAndroidPickerMode] = useState<
    "date" | "time" | null
  >(null);

  const numericOnly = (v: string) => v.replace(/[^0-9]/g, "");

  const canSave = isValid && book != null;

  const onSubmit = async (values: EntryFormValues) => {
    if (!book) return;
    const data = {
      bookId: book.id,
      bookTitle: book.title,
      chapter: values.chapter || undefined,
      page: values.page || undefined,
      percent: values.percent || undefined,
      snippet: values.snippet.trim() || undefined,
      emotionId: values.emotionId || undefined,
      reflection: values.reflection || undefined,
      reflectionUri,
      setting: values.setting || undefined,
      date: values.date.getTime(),
    };

    // Delete audio file if user marked it for deletion
    if (audioToDeleteOnSave.current) {
      deleteAudioFiles([audioToDeleteOnSave.current]).catch(err =>
        console.error('[entry-detail] Failed to delete audio:', err)
      );
      audioToDeleteOnSave.current = null;
    }

    if (isNew) {
      const entryId = await addEntry(data);
      if (entryId && transcriptionStatus !== "idle") {
        registerEntryId(entryId);
      }
    } else {
      updateEntry(existing.id, data);
    }
    router.back();
  };

  const handleDelete = async () => {
    if (!existing) return;

    SheetManager.show(SHEET_IDS.DELETE_ENTRY, {
      payload: {
        title: "Delete Entry",
        description: "Are you sure you want to delete this entry? This action cannot be undone.",
        onConfirm: async () => {
          // Delete audio file if exists
          if (existing.reflectionUri) {
            deleteAudioFiles([existing.reflectionUri]).catch(err =>
              console.error('[entry-detail] Failed to delete audio:', err)
            );
          }
          await removeEntry(existing.id);
          router.back();
        },
      },
    });
  };

  const emotions = useObserveEmotions();
  const coreEmotions = emotions.filter((e) => e.group === "core");
  const secondaryEmotions = emotions.filter((e) => e.group === "secondary");

  const selectedEmotionId = watch("emotionId");
  const snippet = watch("snippet");
  const reflection = watch("reflection");
  const setting = watch("setting");

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
        {!isNew && (
          <Pressable
            onPress={handleDelete}
            hitSlop={8}
            className="mr-3"
          >
            <TrashIcon size={20} color={destructive} />
          </Pressable>
        )}
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
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-xs font-medium uppercase tracking-widest text-muted">
              When
            </Text>
            <Pressable
              onPress={() =>
                SheetManager.show(SHEET_IDS.SETTING, {
                  payload: {
                    current: setting || undefined,
                    onSelect: (v) => setValue("setting", v),
                  },
                })
              }
              hitSlop={8}
              className="p-1"
            >
              {({ pressed }) => (
                <BookOpenIcon
                  size={18}
                  color={pressed ? primary : mutedForeground}
                />
              )}
            </Pressable>
          </View>
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
          {setting ? (
            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-xs text-muted">
                {setting}
              </Text>
            </View>
          ) : null}
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
              {({ pressed }) => (
                <CameraIcon size={18} color={pressed ? primary : mutedForeground} />
              )}
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
          <Animated.View layout={LinearTransition.duration(250)} className="flex-row flex-wrap gap-2">
            {coreEmotions.map((emotion) => {
              const isSelected = selectedEmotionId === emotion.id;
              return (
                <Pressable
                  key={emotion.id}
                  onPress={() =>
                    setValue("emotionId", isSelected ? "" : emotion.id, {
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
            {showMoreEmotions &&
              secondaryEmotions.map((emotion, index) => {
                const isSelected = selectedEmotionId === emotion.id;
                return (
                  <Animated.View
                    key={emotion.id}
                    entering={FadeInDown.duration(250).delay(index * 30)}
                    exiting={FadeOutUp.duration(200)}
                  >
                    <Pressable
                      onPress={() =>
                        setValue("emotionId", isSelected ? "" : emotion.id, {
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
                  </Animated.View>
                );
              })}
            <Animated.View layout={LinearTransition.duration(250).delay(200)}>
              <Pressable
                onPress={() => setShowMoreEmotions((v) => !v)}
                className="flex-row items-center gap-1 rounded-full px-3 py-1.5 bg-secondary border border-border"
              >
                <Text className="text-xs font-medium text-muted">
                  {showMoreEmotions ? "Less" : "More"}
                </Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </View>
        <View className="h-px bg-border" />
        <View className="py-3">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-xs font-medium uppercase tracking-widest text-muted">
              Your Reflection
            </Text>
            <Pressable
              onPress={handleVoicePress}
              hitSlop={8}
              className="p-1"
            >
              {({ pressed }) => (
                <MicrophoneIcon size={18} color={pressed ? primary : mutedForeground} />
              )}
            </Pressable>
          </View>
          <Pressable onPress={() => setFocusTarget("reflection")}>
            {transcriptionStatus === "transcribing" ? (
              <TranscribingIndicator />
            ) : reflection ? (
              <RichTextPreview html={reflection} />
            ) : (
              <Text className="text-sm text-muted/60 italic">
                Tap to write what this made you feel..
              </Text>
            )}
          </Pressable>
          {reflectionUri && (
            <View className="pt-2">
              <AudioPlayer
                uri={reflectionUri}
                onDelete={() => {
                  audioToDeleteOnSave.current = reflectionUri;
                  hasUserDeletedAudio.current = true;
                  setReflectionUri(undefined);
                }}
              />
            </View>
          )}
        </View>
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
          subtitle={snippet && stripHtml(snippet) ? `\u201C${stripHtml(snippet)}\u201D` : ""}
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
      {isVoiceOpen && (
        <VoiceIsland
          bookCoverUrl={book?.coverUrl}
          bookTitle={book?.title}
          bookAuthor={book?.authors?.[0]}
          onSave={(uri) => {
            setReflectionUri(uri);
            startTranscription(uri);
            setIsVoiceOpen(false);
          }}
          onClose={() => setIsVoiceOpen(false)}
        />
      )}

      <CustomPaywall
        visible={showPaywall}
        onDismiss={() => setShowPaywall(false)}
        onPurchaseSuccess={() => setShowPaywall(false)}
      />
    </ScreenWrapper>
  );
};

export default EntryDetailScreen;
