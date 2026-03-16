import { useObservable } from "../../../shared";
import { emotions$, emotionMap$ } from "../services/emotion.service";
import type { EmotionRecord } from "../services/emotion.service";

export function useObserveEmotions(): EmotionRecord[] {
  return useObservable(emotions$, []);
}

export function useEmotionMap(): Map<string, EmotionRecord> {
  return useObservable(emotionMap$, new Map());
}
