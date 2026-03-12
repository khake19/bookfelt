import { useState, useEffect, useMemo } from "react";
import { database, EmotionModel } from "@bookfelt/database";
import { Q } from "@nozbe/watermelondb";

const emotionsCollection = database.get<EmotionModel>("emotions");

export interface EmotionRecord {
  id: string;
  label: string;
  emoji: string;
  color: string;
  group: "core" | "secondary";
  sortOrder: number;
}

function toRecord(model: EmotionModel): EmotionRecord {
  return {
    id: model.id,
    label: model.label,
    emoji: model.emoji,
    color: model.color,
    group: model.group,
    sortOrder: model.sortOrder,
  };
}

export function useObserveEmotions(): EmotionRecord[] {
  const [emotions, setEmotions] = useState<EmotionRecord[]>([]);

  useEffect(() => {
    const subscription = emotionsCollection
      .query(Q.sortBy("sort_order", Q.asc))
      .observe()
      .subscribe((records) => {
        setEmotions(records.map(toRecord));
      });

    return () => subscription.unsubscribe();
  }, []);

  return emotions;
}

export function useEmotionMap(): Map<string, EmotionRecord> {
  const emotions = useObserveEmotions();
  return useMemo(
    () => new Map(emotions.map((e) => [e.label, e])),
    [emotions],
  );
}
