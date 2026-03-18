import { View, Text } from 'react-native';
import type { ArcDataPoint } from '../utils/group-by-week';

const CATEGORIES = [
  { key: 'positive' as const, label: 'Positive', colorClass: 'bg-emotion-positive' },
  { key: 'heavy' as const, label: 'Heavy', colorClass: 'bg-emotion-heavy' },
  { key: 'reflective' as const, label: 'Reflective', colorClass: 'bg-emotion-reflective' },
  { key: 'neutral' as const, label: 'Neutral', colorClass: 'bg-emotion-neutral' },
];

interface EmotionalArcLegendProps {
  data: ArcDataPoint[];
  bookTitle?: string;
}

export function EmotionalArcLegend({ data, bookTitle }: EmotionalArcLegendProps) {
  if (data.length === 0) return null;

  const firstDate = new Date(data[0].date);
  const lastDate = new Date(data[data.length - 1].date);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const totalEntries = data.reduce(
    (sum, point) => sum + (point.entryCount || 1),
    0
  );

  return (
    <View className="mb-6">
      <Text className="text-sm text-muted-foreground mb-1">
        Emotional arc
      </Text>
      {bookTitle && (
        <Text className="text-2xl font-bold text-foreground mb-2">
          {bookTitle}
        </Text>
      )}
      <View className="flex-row items-center gap-2 mb-4">
        <Text className="text-sm text-muted-foreground">
          {formatDate(firstDate)} – {formatDate(lastDate)}
        </Text>
        <Text className="text-sm text-muted-foreground">•</Text>
        <Text className="text-sm text-muted-foreground">
          {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'}
        </Text>
      </View>

      <View className="flex-row items-center gap-4 flex-wrap">
        {CATEGORIES.map((category) => (
          <View key={category.key} className="flex-row items-center gap-1.5">
            <View className={`w-3 h-3 rounded-full ${category.colorClass}`} />
            <Text className="text-sm text-muted-foreground">
              {category.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
