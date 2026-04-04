import { ScrollView, Text, View, Pressable } from "react-native";
import { useState } from "react";
import ActionSheet, { SheetProps } from "react-native-actions-sheet";
import { useRouter } from "expo-router";
import { SheetManager } from "react-native-actions-sheet";
import { useThemeColors, RichTextPreview } from "@/shared";
import { useEntries, useEmotionMap } from "@/features/entries";
import AudioPlayer from "@/features/entries/components/AudioPlayer";

export default function EntryDetailSheet({
  sheetId,
  payload,
}: SheetProps<"entry-detail-sheet">) {
  const { background } = useThemeColors();
  const { entries } = useEntries();
  const emotionMap = useEmotionMap();
  const router = useRouter();

  const entryIds = payload?.entryIds || (payload?.entryId ? [payload.entryId] : []);
  const entryList = entries.filter((e) => entryIds.includes(e.id));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const entry = entryList[selectedIndex];
  const emotion = entry?.emotionId ? emotionMap.get(entry.emotionId) : undefined;

  if (entryList.length === 0) {
    return (
      <ActionSheet id={sheetId} containerStyle={{ backgroundColor: background }}>
        <View className="px-6 py-8">
          <Text className="text-center text-muted">Entry not found</Text>
        </View>
      </ActionSheet>
    );
  }

  const handleEdit = async () => {
    await SheetManager.hide(sheetId);
    router.push({
      pathname: "/entry-detail",
      params: { id: entry.id, bookId: entry.bookId },
    });
  };

  return (
    <ActionSheet
      id={sheetId}
      containerStyle={{ backgroundColor: background }}
      gestureEnabled
      indicatorStyle={{ backgroundColor: '#666', width: 40 }}
    >
      <View className="px-6 pt-4 pb-6">
        {/* Sheet handle hint */}
        <View className="items-center mb-4">
          <Text className="text-xs text-muted/60">Swipe down to close</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={true}
          className="max-h-[70vh]"
        >
          {/* Entry selector for grouped weeks */}
          {entryList.length > 1 && (
            <View className="mb-6">
              <Text className="text-sm text-muted mb-3 text-center">
                {entryList.length} entries this week
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                {entryList.map((e, idx) => {
                  const entryEmotion = e.emotionId ? emotionMap.get(e.emotionId) : undefined;
                  const isSelected = idx === selectedIndex;
                  return (
                    <Pressable
                      key={e.id}
                      onPress={() => setSelectedIndex(idx)}
                      className={`px-3 py-2 rounded-full flex-row items-center gap-2 ${
                        isSelected ? 'bg-primary/15 border border-primary' : 'bg-card border border-border'
                      }`}
                    >
                      {entryEmotion && <Text className="text-lg">{entryEmotion.emoji}</Text>}
                      <Text className={`text-xs ${isSelected ? 'text-primary font-medium' : 'text-muted'}`}>
                        {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Emotion header - Bookfelt style */}
          <View className="items-center mb-6">
            {emotion && (
              <>
                <Text className="text-5xl mb-3">{emotion.emoji}</Text>
                <Text className="text-2xl font-serif text-foreground mb-1">
                  {emotion.label}
                </Text>
                <Text className="text-sm text-muted">
                  Logged on {new Date(entry.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </>
            )}
          </View>

          {/* Location Info */}
          {(entry.page || entry.chapter) && (
            <View className="mb-5 p-3 bg-card/50 rounded-xl flex-row gap-4 justify-center">
              {entry.page && (
                <View className="items-center">
                  <Text className="text-xs text-muted mb-0.5">Page</Text>
                  <Text className="text-base font-medium text-foreground">{entry.page}</Text>
                </View>
              )}
              {entry.chapter && (
                <View className="items-center">
                  <Text className="text-xs text-muted mb-0.5">Chapter</Text>
                  <Text className="text-base font-medium text-foreground">{entry.chapter}</Text>
                </View>
              )}
            </View>
          )}

          {/* Setting */}
          {entry.setting && (
            <View className="mb-5">
              <Text className="text-xs text-muted mb-1.5">Where you were</Text>
              <Text className="text-base text-foreground">{entry.setting}</Text>
            </View>
          )}

          {/* Snippet */}
          {entry.snippet && (
            <View className="mb-5">
              <Text className="text-xs text-muted mb-2">From the book</Text>
              <View className="border-l-2 border-primary/30 pl-3 py-1">
                <RichTextPreview html={entry.snippet} className="text-base text-foreground/80 italic" />
              </View>
            </View>
          )}

          {/* Reflection */}
          {entry.reflection && (
            <View className="mb-5">
              <Text className="text-xs text-muted mb-2">Your thoughts</Text>
              <RichTextPreview html={entry.reflection} className="text-base text-foreground leading-relaxed" />
            </View>
          )}

          {/* Audio */}
          {entry.reflectionUri && (
            <View className="mb-5">
              <Text className="text-xs text-muted mb-2">Voice note</Text>
              <AudioPlayer uri={entry.reflectionUri} />
            </View>
          )}
        </ScrollView>

        {/* Actions */}
        <View className="mt-4 gap-3">
          <Pressable
            onPress={handleEdit}
            className="py-3 px-4 bg-primary rounded-full active:bg-primary/80"
          >
            <Text className="text-center font-semibold text-secondary">View Full Entry</Text>
          </Pressable>

          <Pressable
            onPress={() => SheetManager.hide(sheetId)}
            className="py-3 px-4 bg-card rounded-full active:bg-card/80"
          >
            <Text className="text-center font-medium text-muted">Close</Text>
          </Pressable>
        </View>
      </View>
    </ActionSheet>
  );
}
