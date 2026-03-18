import { map, shareReplay } from "rxjs";
import { database, EmotionModel } from "@bookfelt/database";
import { Q } from "@nozbe/watermelondb";

const emotionsCollection = database.get<EmotionModel>("emotions");

export interface EmotionRecord {
  id: string;
  label: string;
  emoji: string;
  color: string;
  group: "core" | "secondary";
  category: "positive" | "heavy" | "reflective" | "neutral";
  sortOrder: number;
  valence: number;
  intensity: number;
}

function toRecord(model: EmotionModel): EmotionRecord {
  return {
    id: model.id,
    label: model.label,
    emoji: model.emoji,
    color: model.color,
    group: model.group,
    category: model.category,
    sortOrder: model.sortOrder,
    valence: model.valence,
    intensity: model.intensity,
  };
}

export const emotions$ = emotionsCollection
  .query(Q.sortBy("sort_order", Q.asc))
  .observe()
  .pipe(
    map((records) => records.map(toRecord)),
    shareReplay(1),
  );

export const emotionMap$ = emotions$.pipe(
  map((emotions) => new Map(emotions.map((e) => [e.id, e]))),
  shareReplay(1),
);
