import { SafeAreaView } from 'react-native-safe-area-context';

export function ScreenWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-background px-4">
      {children}
    </SafeAreaView>
  );
}
