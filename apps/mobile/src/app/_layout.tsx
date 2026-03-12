import '../../global.css';
import '../shared/sheets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { PortalHost } from '@rn-primitives/portal';
import { SheetProvider } from 'react-native-actions-sheet';
import { DatabaseProvider } from '../providers/DatabaseProvider';

const queryClient = new QueryClient();

export default function RootLayout() {
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
