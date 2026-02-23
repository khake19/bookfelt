import { Tabs } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4A6741',
        tabBarInactiveTintColor: '#9A8F85',
        tabBarStyle: {
          backgroundColor: '#F8F4EE',
          borderTopColor: '#E8E2DA',
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home',
        tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />
      }} />
      <Tabs.Screen name="library" options={{ title: 'Library',
        tabBarIcon: ({ color, size }) => <Feather name="book" size={size} color={color} />
      }} />
      <Tabs.Screen name="search" options={{ title: 'Search',
        tabBarIcon: ({ color, size }) => <Feather name="search" size={size} color={color} />
      }} />
    </Tabs>
  );
}
