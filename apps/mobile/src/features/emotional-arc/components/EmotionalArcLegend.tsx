import { View, Text } from 'react-native';
import type { ArcDataPoint } from '../utils/group-by-week';

interface EmotionalArcLegendProps {
  data: ArcDataPoint[];
}

export function EmotionalArcLegend({ data }: EmotionalArcLegendProps) {
  if (data.length === 0) return null;

  const firstDate = new Date(data[0].date);
  const lastDate = new Date(data[data.length - 1].date);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const totalEntries = data.reduce(
    (sum, point) => sum + (point.entryCount || 1),
    0
  );

  return (
    <View className="mb-6">
      <Text className="text-2xl font-bold text-foreground mb-2">
        Emotional Arc
      </Text>
      <View className="flex-row items-center gap-3 flex-wrap">
        <Text className="text-sm text-muted-foreground">
          {formatDate(firstDate)} – {formatDate(lastDate)}
        </Text>
        <Text className="text-sm text-muted-foreground">•</Text>
        <Text className="text-sm text-muted-foreground">
          {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'}
        </Text>
      </View>
    </View>
  );
}
