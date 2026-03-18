import type { Entry } from '../../entries/types/entry';
import type { EmotionRecord } from '../../entries/services/emotion.service';

export interface ArcDataPoint {
  x: number;
  y: number;
  color: string;
  emoji: string;
  date: number;
  label: string;
  category: 'positive' | 'heavy' | 'reflective' | 'neutral';
  entryCount?: number; // For grouped points
  startDate?: number; // For grouped points - start of week
  endDate?: number; // For grouped points - end of week
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_WEEK = 7;

/**
 * Transform single entry to arc data point
 */
function entryToPoint(
  entry: Entry,
  emotions: Map<string, EmotionRecord>,
  index: number
): ArcDataPoint | null {
  if (!entry.emotionId) return null;

  const emotion = emotions.get(entry.emotionId);
  if (!emotion) return null;

  const yValue = emotion.valence * emotion.intensity;

  return {
    x: index,
    y: yValue,
    color: emotion.color,
    emoji: emotion.emoji,
    date: entry.date,
    label: emotion.label,
  };
}

/**
 * Group entries by week and average their emotional values
 */
export function groupEntriesByWeek(
  entries: Entry[],
  emotions: Map<string, EmotionRecord>,
  threshold: number = 25
): ArcDataPoint[] {
  // Filter entries with valid emotions
  const validEntries = entries
    .map((e) => ({ entry: e, emotion: e.emotionId ? emotions.get(e.emotionId) : null }))
    .filter((item): item is { entry: Entry; emotion: EmotionRecord } => item.emotion !== null);

  if (validEntries.length === 0) {
    return [];
  }

  // If below threshold, return individual points
  if (validEntries.length <= threshold) {
    return validEntries.map(({ entry, emotion }, index) => ({
      x: index,
      y: emotion.valence * emotion.intensity,
      color: emotion.color,
      emoji: emotion.emoji,
      date: entry.date,
      label: emotion.label,
      category: emotion.category,
    }));
  }

  // Group by week
  const firstDate = validEntries[0].entry.date;
  const weekBuckets = new Map<number, { entries: typeof validEntries; sum: number }>();

  validEntries.forEach(({ entry, emotion }) => {
    const daysSinceFirst = Math.floor((entry.date - firstDate) / MS_PER_DAY);
    const weekIndex = Math.floor(daysSinceFirst / DAYS_PER_WEEK);

    if (!weekBuckets.has(weekIndex)) {
      weekBuckets.set(weekIndex, { entries: [], sum: 0 });
    }

    const bucket = weekBuckets.get(weekIndex)!;
    bucket.entries.push({ entry, emotion });
    bucket.sum += emotion.valence * emotion.intensity;
  });

  // Convert buckets to arc points
  const weekNumbers = Array.from(weekBuckets.keys()).sort((a, b) => a - b);

  return weekNumbers.map((weekNum, index) => {
    const bucket = weekBuckets.get(weekNum)!;
    const avgY = bucket.sum / bucket.entries.length;

    // Find most frequent emotion in bucket for color/emoji
    const emotionCounts = new Map<string, number>();
    bucket.entries.forEach(({ emotion }) => {
      emotionCounts.set(emotion.id, (emotionCounts.get(emotion.id) || 0) + 1);
    });

    let mostFrequentEmotion = bucket.entries[0].emotion;
    let maxCount = 0;
    emotionCounts.forEach((count, emotionId) => {
      if (count > maxCount) {
        maxCount = count;
        const emotion = emotions.get(emotionId);
        if (emotion) {
          mostFrequentEmotion = emotion;
        }
      }
    });

    // Use middle entry's date as representative date
    const middleEntry = bucket.entries[Math.floor(bucket.entries.length / 2)].entry;

    // Calculate week start and end dates
    const weekStartDate = firstDate + (weekNum * DAYS_PER_WEEK * MS_PER_DAY);
    const weekEndDate = weekStartDate + ((DAYS_PER_WEEK - 1) * MS_PER_DAY);

    return {
      x: index,
      y: avgY,
      color: mostFrequentEmotion.color,
      emoji: mostFrequentEmotion.emoji,
      date: middleEntry.date,
      label: mostFrequentEmotion.label,
      category: mostFrequentEmotion.category,
      entryCount: bucket.entries.length,
      startDate: weekStartDate,
      endDate: weekEndDate,
    };
  });
}
