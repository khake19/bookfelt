import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenWrapper } from '../shared/components/ScreenWrapper';
import CloseButton from '../shared/components/CloseButton';
import {
  EmotionalArcGraph,
  EmotionalArcLegend,
  useEmotionalArcData,
} from '../features/emotional-arc';

export default function EmotionalArcScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const router = useRouter();
  const arcData = useEmotionalArcData(bookId || '');

  return (
    <ScreenWrapper>
      <View className="flex-row items-center justify-between mb-4">
        <CloseButton onPress={() => router.back()} />
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
            <Text className="text-6xl mb-4">📊</Text>
            <Text className="text-lg font-semibold text-foreground mb-2">
              No emotional data yet
            </Text>
            <Text className="text-sm text-muted-foreground text-center px-8">
              Add emotions to your entries to see your emotional journey
            </Text>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown}>
            <EmotionalArcLegend data={arcData} />
            <EmotionalArcGraph data={arcData} />

            <View className="mt-8 p-4 bg-card rounded-2xl border border-border">
              <Text className="text-sm text-muted-foreground leading-5">
                This graph shows your emotional journey through the book. The
                y-axis represents emotional intensity (positive to negative),
                while each point represents your recorded feelings.
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
