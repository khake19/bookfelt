import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ShareIcon } from 'react-native-heroicons/outline';
import { useRef, useEffect, useState } from 'react';
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
import { useAnalytics } from '@/hooks/use-analytics';

type ChartType = 'arc' | 'radar';

export default function EmotionalArcScreen() {
  const { bookId, bookTitle } = useLocalSearchParams<{ bookId: string; bookTitle?: string }>();
  const router = useRouter();
  const arcData = useEmotionalArcData(bookId || '');
  const emotionMap = useEmotionMap();
  const shareableRef = useRef<View>(null);
  const { share, isCapturing } = useShareEmotionalArc();
  const analytics = useAnalytics();
  const [activeChart, setActiveChart] = useState<ChartType>('arc');

  // Track emotional arc view
  useEffect(() => {
    if (arcData.length > 0) {
      analytics.emotionalArcViewed(
        bookId || '',
        bookTitle || 'Unknown',
        arcData.length
      );
    }
  }, [bookId, bookTitle]); // Only track once per book

  const handleShare = () => {
    if (arcData.length === 0) {
      return;
    }
    analytics.emotionalArcShared(
      bookId || '',
      bookTitle || 'Unknown',
      activeChart
    );
    share(shareableRef, bookTitle);
  };

  const handleTabSwitch = (chart: ChartType) => {
    setActiveChart(chart);
    analytics.emotionalArcTabSwitched(
      bookId || '',
      bookTitle || 'Unknown',
      chart
    );
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

            {/* Tab Switcher */}
            <View className="flex-row gap-8 mb-6 border-b border-border pb-0.5">
              <Pressable
                onPress={() => handleTabSwitch('arc')}
                className="pb-3"
              >
                {({ pressed }) => (
                  <View>
                    <Text className={`text-base font-serif ${
                      activeChart === 'arc'
                        ? 'text-foreground font-semibold'
                        : pressed
                          ? 'text-foreground/70'
                          : 'text-muted'
                    }`}>
                      Timeline
                    </Text>
                    {activeChart === 'arc' && (
                      <View className="absolute -bottom-[3px] left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </View>
                )}
              </Pressable>

              <Pressable
                onPress={() => handleTabSwitch('radar')}
                className="pb-3"
              >
                {({ pressed }) => (
                  <View>
                    <Text className={`text-base font-serif ${
                      activeChart === 'radar'
                        ? 'text-foreground font-semibold'
                        : pressed
                          ? 'text-foreground/70'
                          : 'text-muted'
                    }`}>
                      Distribution
                    </Text>
                    {activeChart === 'radar' && (
                      <View className="absolute -bottom-[3px] left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </View>
                )}
              </Pressable>
            </View>

            {/* Chart Display */}
            {activeChart === 'arc' ? (
              <EmotionalArcGraph data={arcData} />
            ) : (
              <EmotionalRadarChart data={arcData} emotionMap={emotionMap} />
            )}
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
