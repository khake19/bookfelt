import '../../global.css';
import '../shared/sheets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PortalHost } from '@rn-primitives/portal';
import { SheetProvider } from 'react-native-actions-sheet';
import Toast from '../shared/components/Toast';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { database, seedEmotions } from '@bookfelt/database';
import { DatabaseProvider } from '../providers/DatabaseProvider';
import { AuthProvider, useAuth } from '../providers/AuthProvider';
import { syncDatabase } from '../lib/sync';
import { useOnboardingStep } from '../features/books/hooks/use-library';

const queryClient = new QueryClient();

function SyncManager() {
  const { user } = useAuth();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!user) return;

    syncDatabase(user.id);

    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current !== 'active' && nextState === 'active') {
        syncDatabase(user.id);
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, [user]);

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
  useEffect(() => {
    seedEmotions(database);
  }, []);

  return (
    <AuthProvider>
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
