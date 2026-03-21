import { useState, useEffect } from "react";
import { usePremiumStatus } from "./use-premium-status";

/**
 * Usage limits for free tier users
 */
const FREE_TIER_LIMITS = {
  SUMMARIES_PER_MONTH: 3,
  TRANSCRIPTIONS_PER_MONTH: 10,
};

/**
 * Hook to check and enforce usage limits for free users
 * Premium users have unlimited usage
 *
 * TODO: Implement actual usage tracking in Supabase
 * For now, this is a placeholder that demonstrates the pattern
 */
export function useUsageLimits() {
  const { isPremium, isLoading } = usePremiumStatus();

  // TODO: Fetch actual usage counts from Supabase
  // Example query:
  // SELECT
  //   COUNT(*) FILTER (WHERE type = 'summary' AND created_at > start_of_month) as summaries_used,
  //   COUNT(*) FILTER (WHERE type = 'transcription' AND created_at > start_of_month) as transcriptions_used
  // FROM user_usage
  // WHERE user_id = current_user_id

  const [summariesUsed, setSummariesUsed] = useState(0);
  const [transcriptionsUsed, setTranscriptionsUsed] = useState(0);

  // Calculate remaining quota
  const summariesRemaining = isPremium
    ? Infinity
    : Math.max(0, FREE_TIER_LIMITS.SUMMARIES_PER_MONTH - summariesUsed);

  const transcriptionsRemaining = isPremium
    ? Infinity
    : Math.max(0, FREE_TIER_LIMITS.TRANSCRIPTIONS_PER_MONTH - transcriptionsUsed);

  // Check if user can use feature
  const canUseSummary = isPremium || summariesRemaining > 0;
  const canUseTranscription = isPremium || transcriptionsRemaining > 0;

  return {
    isPremium,
    isLoading,
    limits: {
      summaries: {
        used: summariesUsed,
        limit: isPremium ? Infinity : FREE_TIER_LIMITS.SUMMARIES_PER_MONTH,
        remaining: summariesRemaining,
        canUse: canUseSummary,
      },
      transcriptions: {
        used: transcriptionsUsed,
        limit: isPremium ? Infinity : FREE_TIER_LIMITS.TRANSCRIPTIONS_PER_MONTH,
        remaining: transcriptionsRemaining,
        canUse: canUseTranscription,
      },
    },
  };
}

/**
 * Helper function to show upgrade prompt
 */
export function getUpgradeMessage(feature: "summary" | "transcription"): string {
  const limits = {
    summary: FREE_TIER_LIMITS.SUMMARIES_PER_MONTH,
    transcription: FREE_TIER_LIMITS.TRANSCRIPTIONS_PER_MONTH,
  };

  return `You've reached your ${limits[feature]} ${feature === "summary" ? "summaries" : "transcriptions"} limit for this month. Upgrade to Premium for unlimited access!`;
}
