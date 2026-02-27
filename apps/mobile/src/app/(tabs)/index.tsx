import { Text, ScrollView } from "react-native";
import { EntryCard, MOCK_ENTRIES } from "../../features/entries";
import { ScreenWrapper } from "../../shared";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  const handlePress = (id: string) => {
    router.push({
      pathname: "/entry-detail",
      params: { id },
    });
  };

  return (
    <ScreenWrapper>
      <Text className="text-foreground font-mono text-2xl font-bold">
        Home
      </Text>
      <ScrollView contentContainerClassName="gap-2">
        {MOCK_ENTRIES.map((entry) => (
          <EntryCard
            key={entry.id}
            {...entry}
            onPress={() => handlePress(entry.id)}
          />
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}
