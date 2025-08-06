import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function PostScreen() {
  const { postId } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Viewing post: {postId}</Text>
    </View>
  );
}
