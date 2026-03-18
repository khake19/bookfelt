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
  const { bookId, bookTitle } = useLocalSearchParams<{ bookId: string; bookTitle?: string }>();
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
          </Animated.View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
