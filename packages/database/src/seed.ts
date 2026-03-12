import type { Database } from "@nozbe/watermelondb";
import { EmotionModel } from "./models/emotion.model";

const SEED_EMOTIONS: {
  label: string;
  emoji: string;
  color: string;
  group: "core" | "secondary";
}[] = [
  // Core — Warm / Positive (gold shades)
  { label: "Enchanted", emoji: "✨", color: "#C8952A", group: "core" },
  { label: "Warm", emoji: "💛", color: "#D4A843", group: "core" },
  { label: "Moved", emoji: "🥹", color: "#DDB85C", group: "core" },
  { label: "Hopeful", emoji: "😌", color: "#E5C97A", group: "core" },
  { label: "Shocked", emoji: "😮", color: "#EDD894", group: "core" },
  // Core — Heavy / Dark (deep red shades)
  { label: "Heartbroken", emoji: "💔", color: "#8B2D3A", group: "core" },
  { label: "Wrecked", emoji: "💀", color: "#A3404E", group: "core" },
  { label: "Anxious", emoji: "😰", color: "#B85562", group: "core" },
  // Core — Reflective (sage shades)
  { label: "Curious", emoji: "🤔", color: "#6B8C6B", group: "core" },
  { label: "Peaceful", emoji: "🌿", color: "#8BA88B", group: "core" },
  // Core — Frustration (gray-brown shades)
  { label: "Frustrated", emoji: "😤", color: "#7A6B5D", group: "core" },
  { label: "Flat", emoji: "😐", color: "#9C8E80", group: "core" },
  // Secondary — Heavy / Dark (deep red cont.)
  { label: "Haunted", emoji: "🖤", color: "#7A2030", group: "secondary" },
  { label: "Devastated", emoji: "😱", color: "#943848", group: "secondary" },
  { label: "Gutted", emoji: "🗡️", color: "#A3404E", group: "secondary" },
  { label: "Disturbed", emoji: "😳", color: "#B85562", group: "secondary" },
  // Secondary — Sadness / Loss (muted rose)
  { label: "Bereft", emoji: "🖤", color: "#8B6068", group: "secondary" },
  { label: "Melancholic", emoji: "🌧️", color: "#A07880", group: "secondary" },
  { label: "Nostalgic", emoji: "🫂", color: "#B89098", group: "secondary" },
  { label: "Wistful", emoji: "🌄", color: "#CCA8AE", group: "secondary" },
  // Secondary — Tension (amber)
  { label: "Suspicious", emoji: "👀", color: "#A07030", group: "secondary" },
  { label: "Uneasy", emoji: "😬", color: "#B88540", group: "secondary" },
  { label: "Blindsided", emoji: "🤯", color: "#CC9A55", group: "secondary" },
  // Secondary — Warmth (soft gold)
  { label: "Tender", emoji: "🕯️", color: "#D4A843", group: "secondary" },
  { label: "Awestruck", emoji: "🌟", color: "#C8952A", group: "secondary" },
  { label: "Satisfied", emoji: "😊", color: "#E5C97A", group: "secondary" },
  // Secondary — Reflective (sage cont.)
  { label: "Thoughtful", emoji: "💡", color: "#7A9C7A", group: "secondary" },
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
      }),
    );
    await db.batch(...batch);
  });
}
