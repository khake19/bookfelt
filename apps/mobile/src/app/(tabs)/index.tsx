import { Text, ScrollView } from "react-native";
import { EntryCard } from "../../features/entries";
import { ScreenWrapper } from "../../shared";

import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  const handlePress = (entry: {
  id: string
  }) => {
    router.push({
      pathname: "/entry-detail",
      params: {...entry}
    })
  }

  return (
    <ScreenWrapper>
      <Text className="text-foreground font-mono text-2xl font-bold">Home</Text>
      <ScrollView contentContainerClassName="gap-2">
        <EntryCard
          title="The three body problem"
          emoji="🌗"
          chapter="Chapter 12"
          date="2 days ago"
          snippet="No, emptiness is not nothingness. Emptiness is a type of existence. You must use this existential emptiness to fill yourself."
          reaction="a very blah bla"
          tags={["mind-blown"]}
          onPress={() => handlePress({id: 'bf-1'})}
        />
        <EntryCard
          title="The three body problem"
          emoji="🌗"
          chapter="Chapter 12"
          date="2 days ago"
          snippet="No, emptiness is not nothingness. Emptiness is a type of existence. You must use this existential emptiness to fill yourself."
          reaction="a very blah bla"
          tags={["mind-blown"]}
          onPress={() => handlePress({id: 'bf-2'})}
        />
        <EntryCard
          title="The three body problem"
          emoji="🌗"
          chapter="Chapter 12"
          date="2 days ago"
          snippet="No, emptiness is not nothingness. Emptiness is a type of existence. You must use this existential emptiness to fill yourself."
          reaction="a very blah bla"
          tags={["mind-blown"]}
          onPress={() => handlePress({id: 'bf-3'})}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}
