import type { AnalyticsEvent } from './types';

/**
 * Type-safe analytics event builders
 *
 * Usage:
 *   analytics.track(AnalyticsEvents.bookAdded('123', 'Book Title'))
 */
export const AnalyticsEvents = {
  // ── Books ──────────────────────────────────────────────────────

  bookAdded: (bookId: string, title: string, authors?: string, status?: string): AnalyticsEvent => ({
    name: 'book_added',
    properties: { bookId, title, authors, status },
  }),

  bookRemoved: (bookId: string, title: string, status: string, entryCount: number): AnalyticsEvent => ({
    name: 'book_removed',
    properties: { bookId, title, status, entryCount },
  }),

  bookStatusChanged: (bookId: string, title: string, previousStatus: string, newStatus: string): AnalyticsEvent => ({
    name: 'book_status_changed',
    properties: { bookId, title, previousStatus, newStatus },
  }),

  bookFinished: (bookId: string, title: string): AnalyticsEvent => ({
    name: 'book_finished',
    properties: { bookId, title },
  }),

  bookDNF: (bookId: string, title: string): AnalyticsEvent => ({
    name: 'book_dnf',
    properties: { bookId, title },
  }),

  // ── Entries ────────────────────────────────────────────────────

  entryCreated: (
    entryId: string,
    bookId: string,
    bookTitle: string,
    hasAudio: boolean,
    hasEmotion: boolean,
    hasSnippet: boolean,
    hasReflection: boolean,
    hasSetting: boolean
  ): AnalyticsEvent => ({
    name: 'entry_created',
    properties: { entryId, bookId, bookTitle, hasAudio, hasEmotion, hasSnippet, hasReflection, hasSetting },
  }),

  entryUpdated: (
    entryId: string,
    bookId: string,
    updatedFields: string[],
    audioAdded: boolean,
    audioRemoved: boolean
  ): AnalyticsEvent => ({
    name: 'entry_updated',
    properties: { entryId, bookId, updatedFields, audioAdded, audioRemoved },
  }),

  entryRemoved: (entryId: string, bookId: string, hadAudio: boolean): AnalyticsEvent => ({
    name: 'entry_removed',
    properties: { entryId, bookId, hadAudio },
  }),

  entryShared: (
    method: 'share_sheet' | 'save_to_photos',
    entryId: string,
    bookId: string,
    bookTitle: string
  ): AnalyticsEvent => ({
    name: 'entry_shared',
    properties: { method, entryId, bookId, bookTitle },
  }),

  entryShareFailed: (
    method: 'share_sheet' | 'save_to_photos',
    error: string,
    entryId: string
  ): AnalyticsEvent => ({
    name: 'entry_share_failed',
    properties: { method, error, entryId },
  }),

  // ── Bookends ───────────────────────────────────────────────────

  bookendAdded: (
    bookId: string,
    bookTitle: string,
    type: 'first_impression' | 'final_thought' | 'exit_note',
    hasAudio: boolean,
    hasText: boolean
  ): AnalyticsEvent => ({
    name: 'bookend_added',
    properties: { bookId, bookTitle, type, hasAudio, hasText },
  }),

  // ── AI Summary ─────────────────────────────────────────────────

  summaryGenerated: (
    bookId: string,
    bookTitle: string,
    source: 'finished' | 'dnf',
    entryCount: number,
    isPremium: boolean
  ): AnalyticsEvent => ({
    name: 'summary_generated',
    properties: { bookId, bookTitle, source, entryCount, isPremium },
  }),

  // ── Emotional Arc ──────────────────────────────────────────────

  emotionalArcViewed: (bookId: string, bookTitle: string, dataPoints: number): AnalyticsEvent => ({
    name: 'emotional_arc_viewed',
    properties: { bookId, bookTitle, dataPoints },
  }),

  emotionalArcShared: (method: 'share_sheet' | 'save_to_photos', bookTitle?: string): AnalyticsEvent => ({
    name: 'emotional_arc_shared',
    properties: { method, bookTitle },
  }),

  emotionalArcShareFailed: (
    method: 'share_sheet' | 'save_to_photos',
    error: string,
    bookTitle?: string
  ): AnalyticsEvent => ({
    name: 'emotional_arc_share_failed',
    properties: { method, error, bookTitle },
  }),

  // ── Premium ────────────────────────────────────────────────────

  paywallViewed: (hasOfferings: boolean): AnalyticsEvent => ({
    name: 'paywall_viewed',
    properties: { hasOfferings },
  }),

  premiumUpgraded: (packageId: string, productId: string, price: number, currency: string): AnalyticsEvent => ({
    name: 'premium_upgraded',
    properties: { packageId, productId, price, currency },
  }),

  purchaseCancelled: (packageId: string): AnalyticsEvent => ({
    name: 'purchase_cancelled',
    properties: { packageId },
  }),

  purchaseFailed: (packageId: string, error: string): AnalyticsEvent => ({
    name: 'purchase_failed',
    properties: { packageId, error },
  }),

  purchasesRestored: (success: boolean, error?: string): AnalyticsEvent => ({
    name: 'purchases_restored',
    properties: { success, error },
  }),

  freeTierLimitReached: (limitType: 'audio_transcription' | 'summary' | 'bookend', title: string): AnalyticsEvent => ({
    name: 'free_tier_limit_reached',
    properties: { limitType, title },
  }),

  // ── Onboarding ─────────────────────────────────────────────────

  onboardingStarted: (): AnalyticsEvent => ({
    name: 'onboarding_started',
    properties: {},
  }),

  onboardingStepCompleted: (step: number, stepName: string): AnalyticsEvent => ({
    name: 'onboarding_step_completed',
    properties: { step, stepName },
  }),

  onboardingCompleted: (addedBook: boolean, addedFirstImpression: boolean): AnalyticsEvent => ({
    name: 'onboarding_completed',
    properties: { addedBook, addedFirstImpression },
  }),

  onboardingSkipped: (step: number, stepName: string): AnalyticsEvent => ({
    name: 'onboarding_skipped',
    properties: { step, stepName },
  }),

  bookAddedOnboarding: (bookId: string, title: string, authors?: string, source?: string): AnalyticsEvent => ({
    name: 'book_added_onboarding',
    properties: { bookId, title, authors, source },
  }),

  firstImpressionAddedOnboarding: (bookId: string, bookTitle: string, hasAudio: boolean, hasText: boolean): AnalyticsEvent => ({
    name: 'first_impression_added_onboarding',
    properties: { bookId, bookTitle, hasAudio, hasText },
  }),
} as const;
