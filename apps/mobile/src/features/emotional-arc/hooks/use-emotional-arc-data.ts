import { useMemo } from 'react';
import { useEntries, useEmotionMap } from '../../entries';
import { groupEntriesByWeek } from '../utils/group-by-week';

export function useEmotionalArcData(bookId: string) {
  const { entries } = useEntries(bookId);
  const emotionMap = useEmotionMap();

  const arcData = useMemo(() => {
    // Filter entries with emotions
    const withEmotions = entries.filter((e) => e.emotionId);

    // Sort by date ascending (oldest first for chronological arc)
    const sorted = [...withEmotions].sort((a, b) => a.date - b.date);

    // Group by week if needed
    return groupEntriesByWeek(sorted, emotionMap);
  }, [entries, emotionMap]);

  return arcData;
}
