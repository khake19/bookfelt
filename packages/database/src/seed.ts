import type { Database } from "@nozbe/watermelondb";
import { EmotionModel } from "./models/emotion.model";

const SEED_EMOTIONS: {
  label: string;
  emoji: string;
  color: string;
  group: "core" | "secondary";
  valence: number;
  intensity: number;
}[] = [
  // Core — Warm / Positive (gold shades)
  { label: "Enchanted", emoji: "✨", color: "#C8952A", group: "core", valence: 0.8, intensity: 0.9 },
  { label: "Warm", emoji: "💛", color: "#D4A843", group: "core", valence: 0.7, intensity: 0.7 },
  { label: "Moved", emoji: "🥹", color: "#DDB85C", group: "core", valence: 0.6, intensity: 0.8 },
  { label: "Hopeful", emoji: "😌", color: "#E5C97A", group: "core", valence: 0.6, intensity: 0.6 },
  { label: "Shocked", emoji: "😮", color: "#EDD894", group: "core", valence: -0.2, intensity: 0.9 },
  // Core — Heavy / Dark (deep red shades)
  { label: "Heartbroken", emoji: "💔", color: "#8B2D3A", group: "core", valence: -0.9, intensity: 0.95 },
  { label: "Wrecked", emoji: "💀", color: "#A3404E", group: "core", valence: -0.95, intensity: 1.0 },
  { label: "Anxious", emoji: "😰", color: "#B85562", group: "core", valence: -0.6, intensity: 0.8 },
  // Core — Reflective (sage shades)
  { label: "Curious", emoji: "🤔", color: "#6B8C6B", group: "core", valence: 0.3, intensity: 0.5 },
  { label: "Peaceful", emoji: "🌿", color: "#8BA88B", group: "core", valence: 0.5, intensity: 0.3 },
  // Core — Frustration (gray-brown shades)
  { label: "Frustrated", emoji: "😤", color: "#7A6B5D", group: "core", valence: -0.5, intensity: 0.6 },
  { label: "Flat", emoji: "😐", color: "#9C8E80", group: "core", valence: 0, intensity: 0.1 },
  // Secondary — Heavy / Dark (deep red cont.)
  { label: "Haunted", emoji: "🖤", color: "#7A2030", group: "secondary", valence: -0.8, intensity: 0.85 },
  { label: "Devastated", emoji: "😱", color: "#943848", group: "secondary", valence: -0.95, intensity: 0.95 },
  { label: "Gutted", emoji: "🗡️", color: "#A3404E", group: "secondary", valence: -0.85, intensity: 0.9 },
  { label: "Disturbed", emoji: "😳", color: "#B85562", group: "secondary", valence: -0.7, intensity: 0.8 },
  // Secondary — Sadness / Loss (muted rose)
  { label: "Bereft", emoji: "🖤", color: "#8B6068", group: "secondary", valence: -0.7, intensity: 0.7 },
  { label: "Melancholic", emoji: "🌧️", color: "#A07880", group: "secondary", valence: -0.6, intensity: 0.5 },
  { label: "Nostalgic", emoji: "🫂", color: "#B89098", group: "secondary", valence: 0.2, intensity: 0.4 },
  { label: "Wistful", emoji: "🌄", color: "#CCA8AE", group: "secondary", valence: 0.1, intensity: 0.3 },
  // Secondary — Tension (amber)
  { label: "Suspicious", emoji: "👀", color: "#A07030", group: "secondary", valence: -0.4, intensity: 0.6 },
  { label: "Uneasy", emoji: "😬", color: "#B88540", group: "secondary", valence: -0.5, intensity: 0.5 },
  { label: "Blindsided", emoji: "🤯", color: "#CC9A55", group: "secondary", valence: -0.6, intensity: 0.9 },
  // Secondary — Warmth (soft gold)
  { label: "Tender", emoji: "🕯️", color: "#D4A843", group: "secondary", valence: 0.7, intensity: 0.6 },
  { label: "Awestruck", emoji: "🌟", color: "#C8952A", group: "secondary", valence: 0.8, intensity: 0.85 },
  { label: "Satisfied", emoji: "😊", color: "#E5C97A", group: "secondary", valence: 0.6, intensity: 0.5 },
  // Secondary — Reflective (sage cont.)
  { label: "Thoughtful", emoji: "💡", color: "#7A9C7A", group: "secondary", valence: 0.2, intensity: 0.4 },
];

export async function seedEmotions(db: Database): Promise<void> {
  const collection = db.get<EmotionModel>("emotions");
  const count = await collection.query().fetchCount();
  if (count > 0) return;

  await db.write(async () => {
    const batch = SEED_EMOTIONS.map((emotion, index) =>
      collection.prepareCreate((record: EmotionModel) => {
        record._raw.label = emotion.label;
        record._raw.emoji = emotion.emoji;
        record._raw.color = emotion.color;
        record._raw.group = emotion.group;
        record._raw.sort_order = index;
        record._raw.valence = emotion.valence;
        record._raw.intensity = emotion.intensity;
      }),
    );
    await db.batch(...batch);
  });
}
