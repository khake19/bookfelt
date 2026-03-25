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

    emotionalArcShared: (method: 'share_sheet' | 'save_to_photos', bookTitle?: string) => {
      analyticsService.track(AnalyticsEvents.emotionalArcShared(method, bookTitle));
    },

    emotionalArcShareFailed: (method: 'share_sheet' | 'save_to_photos', error: string, bookTitle?: string) => {
      analyticsService.track(AnalyticsEvents.emotionalArcShareFailed(method, error, bookTitle));
    },
  };
}
