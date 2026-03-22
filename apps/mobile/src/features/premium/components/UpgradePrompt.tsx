import { Alert } from "react-native";

interface UpgradePromptOptions {
  title: string;
  message: string;
  onUpgrade: () => void;
}

/**
 * Show upgrade prompt when user hits a limit
 * Consistent Alert UI across the app
 */
export function showUpgradePrompt({
  title,
  message,
  onUpgrade,
}: UpgradePromptOptions) {
  Alert.alert(title, message, [
    {
      text: "Maybe Later",
      style: "cancel",
    },
    {
      text: "Upgrade to Premium",
      onPress: onUpgrade,
      style: "default",
    },
  ]);
}

/**
 * Pre-configured upgrade prompts for common scenarios
 */
export const UpgradePrompts = {
  audioTranscriptionLimit: (onUpgrade: () => void) =>
    showUpgradePrompt({
      title: "Audio Limit Reached",
      message:
        "You've used all 15 free audio transcriptions. Upgrade to Premium for unlimited transcriptions on all your books!",
      onUpgrade,
    }),

  summaryLimit: (onUpgrade: () => void) =>
    showUpgradePrompt({
      title: "Summary Already Generated",
      message:
        "You've already generated a summary for this book. Upgrade to Premium to regenerate summaries!",
      onUpgrade,
    }),

  bookendLimit: (onUpgrade: () => void) =>
    showUpgradePrompt({
      title: "Bookend Limit Reached",
      message:
        "You've used all 3 free bookends. Upgrade to Premium for unlimited bookends on all your books!",
      onUpgrade,
    }),
};
