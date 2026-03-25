/**
 * Analytics event structure
 */
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
}

/**
 * Platform-agnostic analytics client interface
 * Implementations: PostHog (mobile/web), Mixpanel, Amplitude, etc.
 */
export interface AnalyticsClient {
  /**
   * Track an event
   */
  track(event: string, properties?: Record<string, unknown>): void;

  /**
   * Identify a user
   */
  identify(userId: string, properties?: Record<string, unknown>): void;

  /**
   * Reset user identity (on logout)
   */
  reset(): void;
}
