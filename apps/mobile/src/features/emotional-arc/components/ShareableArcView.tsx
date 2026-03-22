import { forwardRef } from 'react';
import { View, Text } from 'react-native';
import type { ArcDataPoint } from '@/features/emotional-arc/utils/group-by-week';
import type { EmotionRecord } from '@/features/entries/services/emotion.service';
import { useThemeColors } from '@/shared';
import { EmotionalArcLegend } from './EmotionalArcLegend';
import { EmotionalArcGraph } from './EmotionalArcGraph';
import { EmotionalRadarChart } from './EmotionalRadarChart';

interface ShareableArcViewProps {
  data: ArcDataPoint[];
  emotionMap: Map<string, EmotionRecord>;
  bookTitle?: string;
}

export const ShareableArcView = forwardRef<View, ShareableArcViewProps>(
  ({ data, emotionMap, bookTitle }, ref) => {
    const theme = useThemeColors();

    return (
      <View
        ref={ref}
        collapsable={false}
        style={{
          width: 1080,
          backgroundColor: theme.background || '#ffffff',
          padding: 40,
        }}
      >
        {/* Legend with book title and date range */}
        <EmotionalArcLegend data={data} bookTitle={bookTitle} />

        {/* Emotional Journey Graph */}
        <EmotionalArcGraph data={data} />

        {/* Emotional Balance Radar Chart */}
        <EmotionalRadarChart data={data} emotionMap={emotionMap} />

        {/* Branding footer */}
        <View
          style={{
            marginTop: 24,
            paddingTop: 24,
            borderTopWidth: 1,
            borderTopColor: theme.border || '#e5e7eb',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: theme.mutedForeground || '#6b7280',
              fontWeight: '500',
            }}
          >
            Created with Bookfelt
          </Text>
        </View>
      </View>
    );
  }
);

ShareableArcView.displayName = 'ShareableArcView';
