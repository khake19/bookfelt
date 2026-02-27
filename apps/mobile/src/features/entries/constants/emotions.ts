export interface Emotion {
  label: string;
  emoji: string;
  color: string;
}

export const EMOTIONS: Emotion[] = [
  { label: "mind-blown", emoji: "🤯", color: "#F0C040" },
  { label: "confused", emoji: "😵‍💫", color: "#9B8AD4" },
  { label: "unsettled", emoji: "😟", color: "#E0956A" },
  { label: "hopeful", emoji: "🌱", color: "#7AB87A" },
  { label: "sad", emoji: "💙", color: "#6A96D4" },
  { label: "fear", emoji: "😰", color: "#C090E0" },
  { label: "curious", emoji: "🔍", color: "#60C4BC" },
  { label: "quiet", emoji: "🌫️", color: "#B0A8A0" },
  { label: "happy", emoji: "😊", color: "#F2D479" },
  { label: "serene", emoji: "🧘", color: "#8EBAC4" },
  { label: "inspired", emoji: "✨", color: "#E4AE6A" },
  { label: "melancholy", emoji: "🥀", color: "#B898B0" },
];

export const getEmotionByLabel = (label: string) =>
  EMOTIONS.find((e) => e.label === label);
