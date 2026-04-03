import PostHog from 'posthog-react-native';
import type { PostHogEventProperties } from 'posthog-react-native';
import Constants from 'expo-constants';
import type { AnalyticsClient } from '@bookfelt/core';
import { AnalyticsService } from '@bookfelt/core';

/**
 * PostHog Configuration
 */
const POSTHOG_API_KEY = Constants.expoConfig?.extra?.posthogApiKey;
const POSTHOG_HOST = Constants.expoConfig?.extra?.posthogHost;

if (!POSTHOG_API_KEY || !POSTHOG_HOST) {
  throw new Error(
    '[PostHog] Missing API key or host. ' +
    'Please set EXPO_PUBLIC_POSTHOG_API_KEY and EXPO_PUBLIC_POSTHOG_HOST in your .env file.'
  );
}

/**
 * PostHog client instance
 */
let posthogClient: PostHog | null = null;

/**
 * PostHog adapter implementing the core AnalyticsClient interface
 */
class PostHogAdapter implements AnalyticsClient {
  constructor(private client: PostHog) {}

  track(event: string, properties?: Record<string, unknown>): void {
    this.client.capture(event, properties as PostHogEventProperties);
  }

  identify(userId: string, properties?: Record<string, unknown>): void {
    this.client.identify(userId, properties as PostHogEventProperties);
  }

  reset(): void {
    this.client.reset();
  }
}

/**
 * Analytics service instance (initialized after PostHog is ready)
 */
let analyticsService: AnalyticsService | null = null;

/**
 * No-op analytics client used before initialization
 */
class NoOpAnalyticsClient implements AnalyticsClient {
  track(): void {
    // No-op: silently ignore until PostHog is ready
  }
  identify(): void {
    // No-op: silently ignore until PostHog is ready
  }
  reset(): void {
    // No-op: silently ignore until PostHog is ready
  }
}

/**
 * Fallback analytics service (used before PostHog is ready)
 */
const fallbackAnalytics = new AnalyticsService(new NoOpAnalyticsClient());

/**
 * Initialize PostHog and create analytics service
 * Call this once when the app starts
 */
export async function initializePostHog(): Promise<PostHog> {
  if (posthogClient) {
    return posthogClient;
  }

  try {
    posthogClient = new PostHog(POSTHOG_API_KEY, {
      host: POSTHOG_HOST,
      // Capture app lifecycle events automatically
      captureAppLifecycleEvents: true,
      // Enable debug mode in development
      debug: __DEV__,
    });

    // Create analytics service with PostHog adapter
    analyticsService = new AnalyticsService(new PostHogAdapter(posthogClient));

    console.log('[PostHog] Initialized successfully');
    return posthogClient;
  } catch (error) {
    console.error('[PostHog] Initialization failed:', error);
    throw error;
  }
}

/**
 * Get analytics service instance
 * Returns a no-op client if PostHog hasn't initialized yet (safe to call anytime)
 */
export function getAnalytics(): AnalyticsService {
  if (!analyticsService) {
    if (__DEV__) {
      console.warn('[Analytics] Not initialized yet, using fallback (events will be ignored)');
    }
    return fallbackAnalytics;
  }
  return analyticsService;
}

/**
 * Identify a user (convenience wrapper)
 */
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  try {
    getAnalytics().identify(userId, properties);
    console.log('[PostHog] User identified:', userId);
  } catch (error) {
    console.error('[PostHog] Failed to identify user:', error);
  }
}

/**
 * Reset user (convenience wrapper)
 */
export function resetUser() {
  try {
    getAnalytics().reset();
    console.log('[PostHog] User reset');
  } catch (error) {
    console.error('[PostHog] Failed to reset user:', error);
  }
}
