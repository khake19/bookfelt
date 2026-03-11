export interface Emotion {
  label: string;
  emoji: string;
  color: string;
}

// 12 core emotions — always visible
export const CORE_EMOTIONS: Emotion[] = [
  // Warm / Positive — gold shades (dark → light = intense → gentle)
  { label: "Enchanted", emoji: "✨", color: "#C8952A" },
  { label: "Warm", emoji: "💛", color: "#D4A843" },
  { label: "Moved", emoji: "🥹", color: "#DDB85C" },
  { label: "Hopeful", emoji: "😌", color: "#E5C97A" },
  { label: "Shocked", emoji: "😮", color: "#EDD894" },
  // Heavy / Dark — deep red shades
  { label: "Heartbroken", emoji: "💔", color: "#8B2D3A" },
  { label: "Wrecked", emoji: "💀", color: "#A3404E" },
  { label: "Anxious", emoji: "😰", color: "#B85562" },
  // Reflective — sage shades
  { label: "Curious", emoji: "🤔", color: "#6B8C6B" },
  { label: "Peaceful", emoji: "🌿", color: "#8BA88B" },
  // Frustration — gray-brown shades
  { label: "Frustrated", emoji: "😤", color: "#7A6B5D" },
  { label: "Flat", emoji: "😐", color: "#9C8E80" },
];

// Secondary emotions — shown after "More"
export const SECONDARY_EMOTIONS: Emotion[] = [
  // Heavy / Dark — deep red shades (cont.)
  { label: "Haunted", emoji: "🖤", color: "#7A2030" },
  { label: "Devastated", emoji: "😱", color: "#943848" },
  { label: "Gutted", emoji: "🗡️", color: "#A3404E" },
  { label: "Disturbed", emoji: "😳", color: "#B85562" },
  // Sadness / Loss — muted rose shades
  { label: "Bereft", emoji: "🖤", color: "#8B6068" },
  { label: "Melancholic", emoji: "🌧️", color: "#A07880" },
  { label: "Nostalgic", emoji: "🫂", color: "#B89098" },
  { label: "Wistful", emoji: "🌄", color: "#CCA8AE" },
  // Tension — amber shades
  { label: "Suspicious", emoji: "👀", color: "#A07030" },
  { label: "Uneasy", emoji: "😬", color: "#B88540" },
  { label: "Blindsided", emoji: "🤯", color: "#CC9A55" },
  // Warmth — soft gold shades
  { label: "Tender", emoji: "🕯️", color: "#D4A843" },
  { label: "Awestruck", emoji: "🌟", color: "#C8952A" },
  { label: "Satisfied", emoji: "😊", color: "#E5C97A" },
  // Reflective — sage shades (cont.)
  { label: "Thoughtful", emoji: "💡", color: "#7A9C7A" },
];

// Combined for lookups (timeline display, etc.)
export const EMOTIONS: Emotion[] = [...CORE_EMOTIONS, ...SECONDARY_EMOTIONS];

export const getEmotionByLabel = (label: string) =>
  EMOTIONS.find((e) => e.label === label);
