import { forwardRef, useMemo } from 'react';
import { View, Text } from 'react-native';
import type { ArcDataPoint } from '@/features/emotional-arc/utils/group-by-week';
import type { EmotionRecord } from '@/features/entries/services/emotion.service';
import type { GraphDimensions } from '@/features/emotional-arc/hooks/use-graph-dimensions';
import { useThemeColors } from '@/shared';
import { EmotionalArcLegend } from './EmotionalArcLegend';
import { EmotionalArcGraph } from './EmotionalArcGraph';
import { EmotionalRadarChart } from './EmotionalRadarChart';

type ChartType = 'arc' | 'radar';

interface ShareableArcViewProps {
  data: ArcDataPoint[];
  emotionMap: Map<string, EmotionRecord>;
  bookTitle?: string;
  activeChart?: ChartType;
}

export const ShareableArcView = forwardRef<View, ShareableArcViewProps>(
  ({ data, emotionMap, bookTitle, activeChart = 'arc' }, ref) => {
    const theme = useThemeColors();

    // Fixed dimensions for shareable graph - smaller and more compact
    const shareableDimensions: GraphDimensions = useMemo(() => {
      const paddingX = 20;
      const paddingY = 30;
      const width = 1000; // 1080 - 2*40 padding
      const height = 400; // Reduced from responsive 550 to 400

      return {
        width,
        height,
        paddingX,
        paddingY,
        graphWidth: width - paddingX * 2,
        graphHeight: height - paddingY * 2,
      };
    }, []);

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

        {/* Render active chart only */}
        {activeChart === 'arc' ? (
          <EmotionalArcGraph data={data} customDimensions={shareableDimensions} isShareable />
        ) : (
          <EmotionalRadarChart data={data} emotionMap={emotionMap} />
        )}

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
