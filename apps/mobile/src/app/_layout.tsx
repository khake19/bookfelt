import '../../global.css';
import '../shared/sheets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PortalHost } from '@rn-primitives/portal';
import { SheetProvider } from 'react-native-actions-sheet';
import Toast from '@/shared/components/Toast';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { database, seedEmotions } from '@bookfelt/database';
import { DatabaseProvider } from '@/providers/DatabaseProvider';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { syncDatabase } from '@/lib/sync';
import { useOnboardingStep } from '@/features/books/hooks/use-library';
import { initializeRevenueCat, setUserId } from '@/features/premium/services/revenuecat';
import { initializePostHog, identifyUser } from '@/services/posthog';

const queryClient = new QueryClient();

function RevenueCatManager() {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize RevenueCat once on app start
  useEffect(() => {
    initializeRevenueCat()
      .then(() => {
        console.log('[RevenueCat] SDK initialized');
        setIsInitialized(true);
      })
      .catch((error) => {
        console.error('[RevenueCat] Initialization failed:', error);
      });
  }, []);

  // Set user ID when logged in
  useEffect(() => {
    if (!isInitialized || !user) return;

    setUserId(user.id)
      .then(() => {
        console.log('[RevenueCat] User ID set:', user.id);
      })
      .catch((error) => {
        console.error('[RevenueCat] Failed to set user ID:', error);
      });
  }, [user, isInitialized]);

  return null;
}

function PostHogManager() {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize PostHog once on app start
  useEffect(() => {
    initializePostHog()
      .then(() => {
        console.log('[PostHog] SDK initialized');
        setIsInitialized(true);
      })
      .catch((error) => {
        console.error('[PostHog] Initialization failed:', error);
      });
  }, []);

  // Identify user when logged in
  useEffect(() => {
    if (!isInitialized || !user) return;

    identifyUser(user.id, {
      email: user.email,
    });
  }, [user, isInitialized]);

  return null;
}

function SyncManager() {
  const { user } = useAuth();
  const appState = useRef(AppState.currentState);
  const [emotionsSeeded, setEmotionsSeeded] = useState(false);

  // Seed emotions first before syncing
  useEffect(() => {
    seedEmotions(database).then(async () => {
      const count = await database.get('emotions').query().fetchCount();
      console.log('[SyncManager] Emotions seeded, count:', count);
      setEmotionsSeeded(true);
    });
  }, []);

  useEffect(() => {
    if (!user || !emotionsSeeded) return;

    syncDatabase(user.id);

    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current !== 'active' && nextState === 'active') {
        syncDatabase(user.id);
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, [user, emotionsSeeded]);

  return null;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const onboardingStep = useOnboardingStep();

  useEffect(() => {
    if (isLoading) return;

    const onAuthScreen = segments[0] === 'sign-in' || segments[0] === 'forgot-password';
    const onResetScreen = segments[0] === 'reset-password';
    const onOnboarding = segments[0] === 'onboarding';

    if (onResetScreen) return;

    if (!session && !onAuthScreen) {
      router.replace('/sign-in');
      return;
    }

    if (session && onAuthScreen) {
      if (onboardingStep >= 3) {
        router.replace('/');
      } else {
        router.replace('/onboarding');
      }
      return;
    }

    if (session && !onOnboarding && onboardingStep < 3) {
      router.replace('/onboarding');
    }
  }, [session, isLoading, segments, onboardingStep]);

  if (isLoading) return null;

  return children;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RevenueCatManager />
      <PostHogManager />
      <SyncManager />
      <DatabaseProvider>
        <QueryClientProvider client={queryClient}>
          <SheetProvider>
            <AuthGate>
              <Stack screenOptions={{ headerShown: false }} />
            </AuthGate>
            <PortalHost />
            <Toast />
          </SheetProvider>
        </QueryClientProvider>
      </DatabaseProvider>
    </AuthProvider>
  );
}
