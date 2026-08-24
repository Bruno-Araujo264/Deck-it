import { router } from 'expo-router';
import {View, Text, StyleSheet, Pressable} from 'react-native';

export default function WifiScreen() {
  return (
    <View style={styles.container}>
      <Text>Tela app/config/wifi</Text>
      <Pressable onPress={() => router.back()}>
        <Text>Voltar</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bcd',
    alignItems: 'center',
    justifyContent: 'center',
  },
});