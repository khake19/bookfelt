import { View, Text, useWindowDimensions } from 'react-native';
import Svg, { Circle, Line, Polygon, G, Text as SvgText } from 'react-native-svg';
import { useMemo } from 'react';
import type { ArcDataPoint } from '@/features/emotional-arc/utils/group-by-week';
import type { EmotionRecord } from '@/features/entries/services/emotion.service';
import { useThemeColors } from '@/shared';

interface EmotionalRadarChartProps {
  data: ArcDataPoint[];
  emotionMap: Map<string, EmotionRecord>;
}

interface CategoryData {
  category: 'positive' | 'heavy' | 'reflective' | 'neutral';
  label: string;
  intensity: number;
  color: string;
  count: number;
}

const CATEGORY_LABELS = {
  positive: 'Positive',
  heavy: 'Heavy',
  reflective: 'Reflective',
  neutral: 'Neutral',
};

export function EmotionalRadarChart({ data, emotionMap }: EmotionalRadarChartProps) {
  const { width: screenWidth } = useWindowDimensions();
  const theme = useThemeColors();

  // Calculate responsive size - 64px accounts for container padding (32px each side)
  const size = Math.min(screenWidth - 64, 450);
  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size * 0.38; // Larger circle for better visibility
  const levels = 4;

  // Calculate average intensity per category
  const categoryData = useMemo(() => {
    const colors = {
      positive: theme.emotionPositive || '#b8a253',
      heavy: theme.emotionHeavy || '#8a2d34',
      reflective: theme.emotionReflective || '#69896b',
      neutral: theme.emotionNeutral || '#766f63',
    };
    const categories: Record<string, { totalIntensity: number; count: number }> = {
      positive: { totalIntensity: 0, count: 0 },
      heavy: { totalIntensity: 0, count: 0 },
      reflective: { totalIntensity: 0, count: 0 },
      neutral: { totalIntensity: 0, count: 0 },
    };

    // Create label-to-emotion map for easier lookup
    const labelToEmotion = new Map<string, EmotionRecord>();
    emotionMap.forEach((emotion) => {
      labelToEmotion.set(emotion.label.toLowerCase(), emotion);
    });

    data.forEach((point) => {
      const emotion = labelToEmotion.get(point.label.toLowerCase());
      if (!emotion) return;

      const category = emotion.category;
      const count = point.entryCount || 1;

      categories[category].totalIntensity += emotion.intensity * count;
      categories[category].count += count;
    });

    // Create radar data for each category
    const radarData: CategoryData[] = Object.entries(categories).map(
      ([category, stats]) => ({
        category: category as CategoryData['category'],
        label: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS],
        intensity: stats.count > 0 ? stats.totalIntensity / stats.count : 0,
        color: colors[category as keyof typeof colors],
        count: stats.count,
      })
    );

    // Order: Positive (top), Heavy (right), Neutral (bottom), Reflective (left)
    const order = ['positive', 'heavy', 'neutral', 'reflective'];
    return order.map((cat) => radarData.find((d) => d.category === cat)!);
  }, [data, emotionMap, theme]);

  // Calculate radar points
  const radarPoints = useMemo(() => {
    const angleStep = (2 * Math.PI) / categoryData.length;

    return categoryData.map((category, index) => {
      const angle = angleStep * index - Math.PI / 2; // Start from top
      const radius = category.intensity * maxRadius;

      return {
        ...category,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        labelX: centerX + (maxRadius + 18) * Math.cos(angle),
        labelY: centerY + (maxRadius + 18) * Math.sin(angle),
        angle,
      };
    });
  }, [categoryData]);

  const polygonPoints = radarPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Get top 3 emotions from the dominant category
  const topEmotions = useMemo(() => {
    // Find dominant category first
    const dominant = categoryData.reduce((max, cat) =>
      cat.intensity > max.intensity ? cat : max
    );

    const emotionCounts = new Map<string, { label: string; count: number; color: string; category: string }>();

    data.forEach((point) => {
      const emotion = Array.from(emotionMap.values()).find(
        (e) => e.label.toLowerCase() === point.label.toLowerCase()
      );

      if (emotion) {
        const existing = emotionCounts.get(emotion.label);
        const count = point.entryCount || 1;

        if (existing) {
          existing.count += count;
        } else {
          emotionCounts.set(emotion.label, {
            label: emotion.label,
            count,
            color: emotion.color,
            category: emotion.category,
          });
        }
      }
    });

    // Filter to only emotions from dominant category, then sort by count
    return Array.from(emotionCounts.values())
      .filter((e) => e.category === dominant.category)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [data, emotionMap, categoryData]);

  // Generate insight text based on intensity (not frequency)
  const insight = useMemo(() => {
    // Use category intensity as the primary signal
    const dominant = categoryData.reduce((max, cat) =>
      cat.intensity > max.intensity ? cat : max
    );

    // Check if there's a clear winner (>10% difference)
    const sorted = [...categoryData].sort((a, b) => b.intensity - a.intensity);
    const intensityGap = sorted[0].intensity - sorted[1].intensity;

    const messages: Record<string, string> = {
      positive: 'An uplifting journey through this book',
      heavy: 'Heavy emotions shaped this read',
      reflective: 'A contemplative reading experience',
      neutral: 'A balanced emotional journey',
    };

    // If it's very close (<5% difference), call it balanced
    if (intensityGap < 0.05) {
      return 'A balanced emotional journey';
    }

    return messages[dominant.category] || messages.neutral;
  }, [categoryData]);

  if (data.length === 0) {
    return null;
  }

  return (
    <View className="items-center py-4 bg-card/30 rounded-2xl mx-2 mb-6 px-6">
      <Text className="text-xs font-medium uppercase tracking-widest text-muted/70 mb-2">
        Emotional Balance
      </Text>

      <Svg width={size} height={size}>
        {/* Background concentric circles */}
        {Array.from({ length: levels }).map((_, i) => {
          const radius = ((i + 1) / levels) * maxRadius;
          return (
            <Circle
              key={`circle-${i}`}
              cx={centerX}
              cy={centerY}
              r={radius}
              stroke="#d1d5db"
              strokeWidth={1}
              fill="none"
              opacity={0.3}
            />
          );
        })}

        {/* Outer border circle - makes it look round */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={maxRadius}
          stroke="#9ca3af"
          strokeWidth={2}
          fill="none"
          opacity={0.4}
        />

        {/* Radial lines */}
        {radarPoints.map((point, index) => (
          <Line
            key={`line-${index}`}
            x1={centerX}
            y1={centerY}
            x2={centerX + maxRadius * Math.cos(point.angle)}
            y2={centerY + maxRadius * Math.sin(point.angle)}
            stroke="#d1d5db"
            strokeWidth={1}
            opacity={0.25}
          />
        ))}

        {/* Filled polygon with gradient effect */}
        <Polygon
          points={polygonPoints}
          fill="#8B5CF6"
          fillOpacity={0.15}
          stroke="#8B5CF6"
          strokeWidth={2}
          opacity={0.6}
        />

        {/* Data points with halos */}
        {radarPoints.map((point, index) => (
          <G key={`point-${index}`}>
            {/* Outer halo */}
            <Circle
              cx={point.x}
              cy={point.y}
              r={10}
              fill={point.color}
              opacity={0.15}
            />
            {/* Middle ring */}
            <Circle
              cx={point.x}
              cy={point.y}
              r={7}
              fill={point.color}
              opacity={0.3}
            />
            {/* Inner dot */}
            <Circle
              cx={point.x}
              cy={point.y}
              r={5}
              fill={point.color}
            />
          </G>
        ))}
      </Svg>

      {/* Insight text */}
      <Text className="text-sm text-muted italic mt-3 mb-2 text-center">
        {insight}
      </Text>

      {/* Stats below */}
      <View className="flex-row flex-wrap gap-x-4 gap-y-2 px-4 mb-4">
        {categoryData
          .filter((cat) => cat.count > 0)
          .map((category) => (
            <View key={category.category} className="flex-row items-center gap-1.5">
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <Text className="text-xs text-foreground">
                {category.label}
              </Text>
              <Text className="text-xs text-muted/60">
                {Math.round(category.intensity * 100)}%
              </Text>
            </View>
          ))}
      </View>

      {/* Top emotions as chips */}
      {topEmotions.length > 0 && (() => {
        const maxCount = Math.max(...topEmotions.map((e) => e.count));
        const showCounts = maxCount > 1;
        const heading = showCounts ? 'Most Felt' : 'Emotions from this read';

        return (
          <View className="pt-3 border-t border-border/50">
            <Text className="text-xs font-medium uppercase tracking-widest text-muted/70 mb-3 text-center">
              {heading}
            </Text>
            <View className="flex-row justify-center gap-2 flex-wrap px-4">
              {topEmotions.map((emotion) => (
                <View
                  key={emotion.label}
                  className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: `${emotion.color}20` }}
                >
                  <View
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: emotion.color }}
                  />
                  <Text className="text-sm font-medium" style={{ color: emotion.color }}>
                    {emotion.label}
                  </Text>
                  {showCounts && (
                    <Text className="text-xs text-muted/60">
                      {emotion.count}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        );
      })()}
    </View>
  );
}
