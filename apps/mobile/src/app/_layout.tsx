import '../../global.css';
import '../shared/sheets';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { PortalHost } from '@rn-primitives/portal';
import { SheetProvider } from 'react-native-actions-sheet';
import * as SplashScreen from 'expo-splash-screen';
import { database } from '@bookfelt/database';
import { DatabaseProvider } from '../database/DatabaseProvider';
import { migrateFromAsyncStorage } from '../database/migrate-from-async-storage';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    migrateFromAsyncStorage(database)
      .then(() => setReady(true))
      .catch((err) => {
        console.error('Migration failed:', err);
        setReady(true);
      })
      .finally(() => SplashScreen.hideAsync());
  }, []);

  if (!ready) return null;

  return (
    <DatabaseProvider>
      <QueryClientProvider client={queryClient}>
        <SheetProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <PortalHost />
        </SheetProvider>
      </QueryClientProvider>
    </DatabaseProvider>
  );
}
