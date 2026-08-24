import { router } from 'expo-router';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Deck-it</Text>
      <Pressable onPress={() => router.push('/login')}>
        <Text>Entrar</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});