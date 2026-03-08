export interface Emotion {
  label: string;
  emoji: string;
  color: string;
}

export const EMOTIONS: Emotion[] = [
  // High Tension
  { label: "Mind-blown", emoji: "⚡", color: "#F0C040" },
  { label: "Betrayed", emoji: "🗡️", color: "#C4564A" },
  { label: "Suspicious", emoji: "🗝️", color: "#B89860" },
  { label: "Anxious", emoji: "🫀", color: "#D4786A" },
  { label: "Appalled", emoji: "💀", color: "#7A7068" },
  // Deep Feeling
  { label: "Wrecked", emoji: "🥀", color: "#B05060" },
  { label: "Melancholy", emoji: "🍂", color: "#B8885A" },
  { label: "Soft", emoji: "🕊️", color: "#A8B8A0" },
  { label: "Nostalgic", emoji: "⏳", color: "#C4A870" },
  { label: "Bittersweet", emoji: "☕", color: "#8B7260" },
  // Intellectual
  { label: "Awe-struck", emoji: "✨", color: "#E4AE6A" },
  { label: "Inspired", emoji: "✍️", color: "#D4A050" },
  { label: "Intrigued", emoji: "📜", color: "#A09070" },
  { label: "Enlightened", emoji: "💡", color: "#E0C060" },
  { label: "Haunted", emoji: "🌑", color: "#605850" },
];

export const getEmotionByLabel = (label: string) =>
  EMOTIONS.find((e) => e.label === label);
