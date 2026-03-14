import '../../global.css';
import '../shared/sheets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PortalHost } from '@rn-primitives/portal';
import { SheetProvider } from 'react-native-actions-sheet';
import Toast from '../shared/components/Toast';
import { useEffect } from 'react';
import { database, seedEmotions } from '@bookfelt/database';
import { DatabaseProvider } from '../providers/DatabaseProvider';
import { AuthProvider, useAuth } from '../providers/AuthProvider';

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const onAuthScreen = segments[0] === 'sign-in';

    if (!session && !onAuthScreen) {
      router.replace('/sign-in');
    } else if (session && onAuthScreen) {
      router.replace('/');
    }
  }, [session, isLoading, segments]);

  if (isLoading) return null;

  return children;
}

export default function RootLayout() {
  useEffect(() => {
    seedEmotions(database);
  }, []);

  return (
    <AuthProvider>
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
