import { View, Text } from 'react-native';
import Svg, { Circle, Line, Polygon, G, Text as SvgText } from 'react-native-svg';
import { useMemo } from 'react';
import type { ArcDataPoint } from '../utils/group-by-week';
import type { EmotionRecord } from '../../entries/services/emotion.service';
import { useThemeColors } from '../../../shared';

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
  const size = 340;
  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = 140;
  const levels = 4;

  const theme = useThemeColors();

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
        labelX: centerX + (maxRadius + 30) * Math.cos(angle),
        labelY: centerY + (maxRadius + 30) * Math.sin(angle),
        angle,
      };
    });
  }, [categoryData]);

  const polygonPoints = radarPoints.map((p) => `${p.x},${p.y}`).join(' ');

  if (data.length === 0) {
    return null;
  }

  return (
    <View className="items-center py-4 bg-card/30 rounded-2xl mx-4 my-6">
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

        {/* Category labels */}
        {radarPoints.map((point, index) => {
          const isTop = index === 0;
          const isBottom = index === 2;
          const isRight = index === 1;

          return (
            <G key={`label-${index}`}>
              <SvgText
                x={point.labelX}
                y={point.labelY}
                fontSize="11"
                fontWeight="500"
                fill={point.color}
                textAnchor={isRight ? 'start' : isTop || isBottom ? 'middle' : 'end'}
                alignmentBaseline={isTop ? 'baseline' : isBottom ? 'hanging' : 'middle'}
              >
                {point.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>

      {/* Stats below */}
      <View className="mt-4 flex-row flex-wrap gap-x-4 gap-y-2 px-4">
        {categoryData
          .filter((cat) => cat.count > 0)
          .map((category) => (
            <View key={category.category} className="flex-row items-center gap-1.5">
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <Text className="text-xs text-foreground">{category.label}</Text>
              <Text className="text-xs text-muted/60">
                {Math.round(category.intensity * 100)}%
              </Text>
            </View>
          ))}
      </View>
    </View>
  );
}
