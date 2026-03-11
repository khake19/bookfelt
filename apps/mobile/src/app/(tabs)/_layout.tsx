import { Tabs } from 'expo-router';
import { HomeIcon, BookOpenIcon } from 'react-native-heroicons/solid';
import { useThemeColors, FloatingActionButton } from '../../shared';

export default function TabLayout() {
  const { primary, muted } = useThemeColors();

  return (
    <Tabs
      tabBar={(props) => <FloatingActionButton {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: primary,
        tabBarInactiveTintColor: muted,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home',
        tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />
      }} />
      <Tabs.Screen name="library" options={{ title: 'Library',
        tabBarIcon: ({ color, size }) => <BookOpenIcon size={size} color={color} />
      }} />
    </Tabs>
  );
}
