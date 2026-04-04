import { useLibrary } from "@/features/books/hooks/use-library";
import { useEntries } from "@/features/entries";
import { usePremiumStatus } from "./use-premium-status";

/**
 * Free Tier Limits
 */
const FREE_TIER_LIMITS = {
  TOTAL_AUDIO_TRANSCRIPTIONS: 15, // Global limit across all books
  SUMMARIES_PER_BOOK: 1, // 1 summary per book
  TOTAL_BOOKENDS: 3, // 3 bookends total across all books
};

/**
 * Hook to check usage limits for free users
 *
 * Free Tier Model:
 * - 15 audio transcriptions total (use across any books)
 * - 3 bookends total (first impression, final thought, exit note - use across any books)
 * - 1 AI summary per book
 *
 * Premium: Unlimited everything
 */
export function useBookLimits(bookId?: string) {
  const { isPremium, isLoading: isPremiumLoading } = usePremiumStatus();
  const { books } = useLibrary();

  // Get ALL entries across all books for global audio count
  const { entries: allEntries } = useEntries(); // No bookId = all entries

  // Count TOTAL audio transcriptions across ALL books (global limit)
  const totalAudioUsed = allEntries.filter(
    (entry) => entry.reflectionUri != null,
  ).length;

  // Calculate global audio limit
  const audioTranscriptionsRemaining = isPremium
    ? Infinity
    : Math.max(0, FREE_TIER_LIMITS.TOTAL_AUDIO_TRANSCRIPTIONS - totalAudioUsed);

  // Check if user can use features
  const canTranscribeAudio = isPremium || audioTranscriptionsRemaining > 0;

  // Audio files are always saved when transcribing (no per-book restriction)
  const canSaveAudioFiles = canTranscribeAudio;

  // Summary: 1 per book (check if current book already has summary)
  const currentBook = bookId ? books.find((b) => b.id === bookId) : undefined;
  const hasSummary = !!currentBook?.summary;
  // Only allow generation if we have a book AND (user is premium OR book doesn't have summary yet)
  const canGenerateSummary = !!currentBook && (isPremium || !hasSummary);

  // Count total bookends used across all books
  const totalBookendsUsed = books.reduce((sum, book) => {
    let count = 0;
    if (book.firstImpression) count++;
    if (book.finalThought) count++;
    if (book.exitNote) count++;
    return sum + count;
  }, 0);

  const bookendsRemaining = isPremium
    ? Infinity
    : Math.max(0, FREE_TIER_LIMITS.TOTAL_BOOKENDS - totalBookendsUsed);

  const canUseBookends = isPremium || bookendsRemaining > 0;

  return {
    isPremium,
    isLoading: isPremiumLoading,
    limits: {
      audioTranscriptions: {
        used: totalAudioUsed,
        limit: isPremium
          ? Infinity
          : FREE_TIER_LIMITS.TOTAL_AUDIO_TRANSCRIPTIONS,
        remaining: audioTranscriptionsRemaining,
        canUse: canTranscribeAudio,
      },
      audioPlayback: {
        canSave: canSaveAudioFiles,
        reason: !canSaveAudioFiles
          ? `You've used all ${FREE_TIER_LIMITS.TOTAL_AUDIO_TRANSCRIPTIONS} free audio transcriptions. Upgrade to Premium for unlimited!`
          : undefined,
      },
      summary: {
        canGenerate: canGenerateSummary,
        reason: !canGenerateSummary
          ? "You've already generated a summary for this book. Upgrade to Premium to regenerate summaries!"
          : undefined,
      },
      bookends: {
        used: totalBookendsUsed,
        limit: isPremium ? Infinity : FREE_TIER_LIMITS.TOTAL_BOOKENDS,
        remaining: bookendsRemaining,
        canUse: canUseBookends,
        reason: !canUseBookends
          ? `You've used all ${FREE_TIER_LIMITS.TOTAL_BOOKENDS} free bookends. Upgrade to Premium for unlimited bookends on all your books!`
          : undefined,
      },
    },
  };
}

/**
 * Get upgrade message based on limit type
 */
export function getUpgradeMessage(
  limitType: "audio" | "audioPlayback" | "summary",
): string {
  const messages = {
    audio: `You've used all ${FREE_TIER_LIMITS.TOTAL_AUDIO_TRANSCRIPTIONS} free audio transcriptions. Upgrade to Premium for unlimited transcriptions!`,
    audioPlayback: `You've used all ${FREE_TIER_LIMITS.TOTAL_AUDIO_TRANSCRIPTIONS} free audio transcriptions. Upgrade to Premium for unlimited!`,
    summary: `You've already generated a summary for this book. Upgrade to Premium to regenerate summaries!`,
  };

  return messages[limitType];
}
