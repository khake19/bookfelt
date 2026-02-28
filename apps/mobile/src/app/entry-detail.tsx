import { useState } from "react";
import { Button, Input } from "@bookfelt/ui";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { EMOTIONS, FocusModeOverlay, RichTextPreview, useEntries } from "../features/entries";
import { useLibrary } from "../features/books/hooks/use-library";
import { CloseButton, ScreenWrapper, useThemeColors } from "../shared";

const EntryDetailScreen = () => {
  const { id, bookId } = useLocalSearchParams<{ id: string; bookId?: string }>();
  const router = useRouter();
  const { books } = useLibrary();
  const { addEntry } = useEntries();
  const book = books.find((b) => b.id === bookId) ?? books.find((b) => b.status === "reading");
  const isNew = !id;

  const [chapter, setChapter] = useState("");
  const [page, setPage] = useState("");
  const [percent, setPercent] = useState("");
  const [snippet, setSnippet] = useState("");
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const { primary } = useThemeColors();

  const canSave = snippet.trim().length > 0 && book != null;

  const handleSave = () => {
    if (!canSave) return;
    addEntry({
      bookId: book.id,
      bookTitle: book.title,
      chapter: chapter || undefined,
      page: page || undefined,
      percent: percent || undefined,
      snippet: snippet.trim(),
      feeling: selectedFeeling ?? undefined,
      reflection: reflection || undefined,
      date: date.getTime(),
    });
    router.back();
  };

  return (
    <ScreenWrapper>
      <View className="flex-row items-center pt-[34px] pb-3 border-b border-border">
        <CloseButton onPress={() => router.back()} />
        <View className="flex-1 items-center">
          <Text className="text-foreground font-serif font-semibold" numberOfLines={1}>
            {book?.title ?? "No book selected"}
          </Text>
        </View>
        <Button shape="pill" onPress={handleSave} disabled={!canSave}>
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
            <View className={`flex-1 flex-row items-center rounded-lg py-2.5 px-3 gap-1.5 ${chapter ? "bg-primary/10 border-[1.5px] border-primary" : "bg-card border-[1.5px] border-border"}`}>
              <Text className="text-xs text-muted">Ch.</Text>
              <Input
                className="flex-1 h-auto w-full border-0 bg-transparent p-0 text-sm leading-tight text-foreground shadow-none placeholder:font-light"
                value={chapter}
                onChangeText={setChapter}
                placeholder="—"
                keyboardType="number-pad"
              />
            </View>
            <View className={`flex-1 flex-row items-center rounded-lg py-2.5 px-3 gap-1.5 ${page ? "bg-primary/10 border-[1.5px] border-primary" : "bg-card border-[1.5px] border-border"}`}>
              <Text className="text-xs text-muted">Pg.</Text>
              <Input
                className="flex-1 h-auto w-full border-0 bg-transparent p-0 text-sm leading-tight text-foreground shadow-none placeholder:font-light"
                value={page}
                onChangeText={setPage}
                placeholder="—"
                keyboardType="number-pad"
              />
            </View>
            <View className={`flex-1 flex-row items-center rounded-lg py-2.5 px-3 gap-1.5 ${percent ? "bg-primary/10 border-[1.5px] border-primary" : "bg-card border-[1.5px] border-border"}`}>
              <Text className="text-xs text-muted">%</Text>
              <Input
                className="flex-1 h-auto w-full border-0 bg-transparent p-0 text-sm leading-tight text-foreground shadow-none placeholder:font-light"
                value={percent}
                onChangeText={setPercent}
                placeholder="—"
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>
        <View className="h-px bg-border" />
        <View>
          <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-1.5">
            When
          </Text>
          <View className="flex-row items-center">
            <DateTimePicker
              value={date}
              mode="datetime"
              display="compact"
              maximumDate={new Date()}
              onChange={(_, selected) => {
                if (selected) setDate(selected);
              }}
              accentColor="gray"
              style={{ marginLeft: -10, transform: [{ scale: 0.85 }], transformOrigin: "left" }}
            />
          </View>
        </View>
        <View className="h-px bg-border" />
        <View>
          <Text className="text-xs font-medium tracking-widest text-muted mb-1.5">
            SNIPPET
          </Text>
          <View className="border-l-2 border-foreground/20 rounded-l pl-3">
            <Input
              className="h-auto w-full border-0 bg-transparent p-0 text-sm leading-relaxed text-foreground/70 font-serif-italic shadow-none placeholder:font-light"
              value={snippet}
              onChangeText={setSnippet}
              placeholder="Paste or type a passage that resonated..."
              multiline
              numberOfLines={4}
              style={{ minHeight: 80, textAlignVertical: "top" }}
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
                    setSelectedFeeling(isSelected ? null : emotion.label)
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
      {isFocusMode && <FocusModeOverlay snippet={snippet ? `\u201C${snippet}\u201D` : ""} reflection={reflection} onChangeReflection={setReflection} onDone={() => setIsFocusMode(false)} />}
    </ScreenWrapper>
  );
};

export default EntryDetailScreen;
