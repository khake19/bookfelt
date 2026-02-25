import { Text, View } from "react-native";
import { ScreenWrapper } from "../shared";

import { useLocalSearchParams } from "expo-router";

const EntryDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScreenWrapper>
      <View>
        <Text>Entry Detail {id}</Text>
      </View>
    </ScreenWrapper>
  );
};

export default EntryDetailScreen;
