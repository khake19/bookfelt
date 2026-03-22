import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ShareIcon } from 'react-native-heroicons/outline';
import { useRef } from 'react';
import { ScreenWrapper } from '@/shared/components/ScreenWrapper';
import CloseButton from '@/shared/components/CloseButton';
import {
  EmotionalArcGraph,
  EmotionalArcLegend,
  EmotionalRadarChart,
  useEmotionalArcData,
  ShareableArcView,
  useShareEmotionalArc,
} from '@/features/emotional-arc';
import { useEmotionMap } from '@/features/entries';

export default function EmotionalArcScreen() {
  const { bookId, bookTitle } = useLocalSearchParams<{ bookId: string; bookTitle?: string }>();
  const router = useRouter();
  const arcData = useEmotionalArcData(bookId || '');
  const emotionMap = useEmotionMap();
  const shareableRef = useRef<View>(null);
  const { share, isCapturing } = useShareEmotionalArc();

  const handleShare = () => {
    if (arcData.length === 0) {
      return;
    }
    share(shareableRef, bookTitle);
  };

  return (
    <ScreenWrapper>
      <View className="flex-row items-center justify-between mb-4">
        <CloseButton onPress={() => router.back()} />

        {arcData.length > 0 && (
          <Pressable
            className="w-[30px] h-[30px] rounded-full bg-card items-center justify-center"
            onPress={handleShare}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator size="small" />
            ) : (
              <ShareIcon size={20} color="#8B5CF6" />
            )}
          </Pressable>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8"
      >
        {arcData.length === 0 ? (
          <Animated.View
            entering={FadeInDown}
            className="items-center justify-center py-20"
          >
            <Text className="text-lg font-semibold text-foreground mb-2">
              No emotional data yet
            </Text>
            <Text className="text-sm text-muted-foreground text-center px-8">
              Add emotions to your entries to see your emotional journey
            </Text>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown}>
            <EmotionalArcLegend data={arcData} bookTitle={bookTitle} />
            <EmotionalArcGraph data={arcData} />
            <EmotionalRadarChart data={arcData} emotionMap={emotionMap} />
          </Animated.View>
        )}
      </ScrollView>

      {/* Off-screen ShareableArcView for capture */}
      {arcData.length > 0 && (
        <View style={{ position: 'absolute', left: -9999 }}>
          <ShareableArcView
            ref={shareableRef}
            data={arcData}
            emotionMap={emotionMap}
            bookTitle={bookTitle}
          />
        </View>
      )}
    </ScreenWrapper>
  );
}
