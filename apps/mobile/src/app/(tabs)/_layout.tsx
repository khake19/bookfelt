import { Tabs } from 'expo-router';
import { HomeIcon, BookOpenIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { useThemeColors } from '../../shared';

export default function TabLayout() {
  const { primary, muted, background, border } = useThemeColors();

  console.log('primary', primary)
  console.log('muted', muted)
  console.log('background', background)
  console.log('border', border)
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: primary,
        tabBarInactiveTintColor: muted,
        tabBarStyle: {
          backgroundColor: background,
          borderTopColor: border,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home',
        tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />
      }} />
      <Tabs.Screen name="library" options={{ title: 'Library',
        tabBarIcon: ({ color, size }) => <BookOpenIcon size={size} color={color} />
      }} />
      <Tabs.Screen name="search" options={{ title: 'Search',
        tabBarIcon: ({ color, size }) => <MagnifyingGlassIcon size={size} color={color} />
      }} />
    </Tabs>
  );
}
