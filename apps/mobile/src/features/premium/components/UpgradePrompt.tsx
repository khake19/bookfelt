import { Alert } from "react-native";
import { AnalyticsEvents } from "@bookfelt/core";
import { getAnalytics } from "@/services/posthog";

interface UpgradePromptOptions {
  title: string;
  message: string;
  onUpgrade: () => void;
  limitType?: string;
}

/**
 * Show upgrade prompt when user hits a limit
 * Consistent Alert UI across the app
 */
export function showUpgradePrompt({
  title,
  message,
  onUpgrade,
  limitType,
}: UpgradePromptOptions) {
  // Track when user hits free tier limit
  if (limitType) {
    getAnalytics().track(
      AnalyticsEvents.freeTierLimitReached(limitType as any, title)
    );
  }

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
      limitType: "audio_transcription",
    }),

  summaryLimit: (onUpgrade: () => void) =>
    showUpgradePrompt({
      title: "Summary Already Generated",
      message:
        "You've already generated a summary for this book. Upgrade to Premium to regenerate summaries!",
      onUpgrade,
      limitType: "summary",
    }),

  bookendLimit: (onUpgrade: () => void) =>
    showUpgradePrompt({
      title: "Bookend Limit Reached",
      message:
        "You've used all 3 free bookends. Upgrade to Premium for unlimited bookends on all your books!",
      onUpgrade,
      limitType: "bookend",
    }),

  distributionChart: (onUpgrade: () => void) =>
    showUpgradePrompt({
      title: "Premium Feature",
      message:
        "The Distribution view provides advanced emotional analytics. Upgrade to Premium to unlock deeper insights into your reading journey!",
      onUpgrade,
      limitType: "distribution_chart",
    }),
};
