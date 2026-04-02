import { AnalyticsEvents } from '@bookfelt/core';
import { getAnalytics } from '@/services/posthog';

/**
 * Hook for tracking analytics events in React components
 * Usage: const analytics = useAnalytics();
 *        analytics.paywallViewed(true);
 */
export function useAnalytics() {
  const analyticsService = getAnalytics();

  return {
    // Premium events
    paywallViewed: (hasOfferings: boolean) => {
      analyticsService.track(AnalyticsEvents.paywallViewed(hasOfferings));
    },

    premiumUpgraded: (packageId: string, productId: string, price: number, currency: string) => {
      analyticsService.track(AnalyticsEvents.premiumUpgraded(packageId, productId, price, currency));
    },

    purchaseCancelled: (packageId: string) => {
      analyticsService.track(AnalyticsEvents.purchaseCancelled(packageId));
    },

    purchaseFailed: (packageId: string, error: string) => {
      analyticsService.track(AnalyticsEvents.purchaseFailed(packageId, error));
    },

    purchasesRestored: (success: boolean, error?: string) => {
      analyticsService.track(AnalyticsEvents.purchasesRestored(success, error));
    },

    // Emotional Arc events
    emotionalArcViewed: (bookId: string, bookTitle: string, dataPoints: number) => {
      analyticsService.track(AnalyticsEvents.emotionalArcViewed(bookId, bookTitle, dataPoints));
    },

    emotionalArcTabSwitched: (bookId: string, bookTitle: string, tab: 'arc' | 'radar') => {
      analyticsService.track(AnalyticsEvents.emotionalArcTabSwitched(bookId, bookTitle, tab));
    },

    emotionalArcShared: (bookId: string, bookTitle: string, activeTab: 'arc' | 'radar') => {
      analyticsService.track(AnalyticsEvents.emotionalArcShared(bookId, bookTitle, activeTab));
    },

    emotionalArcShareFailed: (method: 'share_sheet' | 'save_to_photos', error: string, bookTitle?: string) => {
      analyticsService.track(AnalyticsEvents.emotionalArcShareFailed(method, error, bookTitle));
    },

    // Entry events
    entryShared: (method: 'share_sheet' | 'save_to_photos', entryId: string, bookId: string, bookTitle: string) => {
      analyticsService.track(AnalyticsEvents.entryShared(method, entryId, bookId, bookTitle));
    },

    entryShareFailed: (method: 'share_sheet' | 'save_to_photos', error: string, entryId: string) => {
      analyticsService.track(AnalyticsEvents.entryShareFailed(method, error, entryId));
    },
  };
}
