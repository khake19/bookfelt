import type { AnalyticsClient, AnalyticsEvent } from './types';

/**
 * Platform-agnostic analytics service
 *
 * Wraps any analytics client (PostHog, Mixpanel, Amplitude, etc.)
 * and provides a consistent interface for tracking events.
 */
export class AnalyticsService {
  constructor(private client: AnalyticsClient) {}

  /**
   * Track an analytics event
   */
  track(event: AnalyticsEvent): void {
    try {
      this.client.track(event.name, event.properties);
    } catch (error) {
      console.error('[Analytics] Failed to track event:', event.name, error);
    }
  }

  /**
   * Identify a user
   */
  identify(userId: string, properties?: Record<string, unknown>): void {
    try {
      this.client.identify(userId, properties);
    } catch (error) {
      console.error('[Analytics] Failed to identify user:', userId, error);
    }
  }

  /**
   * Reset user identity (on logout)
   */
  reset(): void {
    try {
      this.client.reset();
    } catch (error) {
      console.error('[Analytics] Failed to reset user:', error);
    }
  }
}
