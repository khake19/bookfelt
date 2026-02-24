import { Text, ScrollView } from "react-native";
import BookCards from "../../components/BookCards";
import { ScreenWrapper } from "../../components/ScreenWrapper";

export default function HomeScreen() {
  return (
    <ScreenWrapper>
      <Text className="text-foreground font-mono text-2xl font-bold">Home</Text>
      <ScrollView contentContainerClassName="gap-2">
        <BookCards
          title="The three body problem"
          emoji="🌗"
          chapter="Chapter 12"
          date="2 days ago"
          snippet="No, emptiness is not nothingness. Emptiness is a type of existence. You must use this existential emptiness to fill yourself."
          reaction="a very blah bla"
          tags={["mind-blown"]}
        />
        <BookCards
          title="The three body problem"
          emoji="🌗"
          chapter="Chapter 12"
          date="2 days ago"
          snippet="No, emptiness is not nothingness. Emptiness is a type of existence. You must use this existential emptiness to fill yourself."
          reaction="a very blah bla"
          tags={["mind-blown"]}
        />
        <BookCards
          title="The three body problem"
          emoji="🌗"
          chapter="Chapter 12"
          date="2 days ago"
          snippet="No, emptiness is not nothingness. Emptiness is a type of existence. You must use this existential emptiness to fill yourself."
          reaction="a very blah bla"
          tags={["mind-blown"]}
        />
        <BookCards
          title="The three body problem"
          emoji="🌗"
          chapter="Chapter 12"
          date="2 days ago"
          snippet="No, emptiness is not nothingness. Emptiness is a type of existence. You must use this existential emptiness to fill yourself."
          reaction="a very blah bla"
          tags={["mind-blown"]}
        />
        <BookCards
          title="The three body problem"
          emoji="🌗"
          chapter="Chapter 12"
          date="2 days ago"
          snippet="No, emptiness is not nothingness. Emptiness is a type of existence. You must use this existential emptiness to fill yourself."
          reaction="a very blah bla"
          tags={["mind-blown"]}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}
