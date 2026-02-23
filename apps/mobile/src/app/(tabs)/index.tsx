import { Text } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Button } from "@bookfelt/ui"

export default function HomeScreen() {
  return (
    <ScreenWrapper>
      <Text className="text-foreground text-2xl font-bold">Home</Text>
      <Button><Text className='text-secondary'>Hello</Text></Button>
    </ScreenWrapper>
  );
}
