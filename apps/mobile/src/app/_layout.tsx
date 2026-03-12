import '../../global.css';
import '../shared/sheets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { PortalHost } from '@rn-primitives/portal';
import { SheetProvider } from 'react-native-actions-sheet';
import { useEffect } from 'react';
import { database, seedEmotions } from '@bookfelt/database';
import { DatabaseProvider } from '../providers/DatabaseProvider';

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    seedEmotions(database);
  }, []);

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
