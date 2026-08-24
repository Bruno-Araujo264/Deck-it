import { router } from 'expo-router';
import {View, Text, StyleSheet, Pressable} from 'react-native';

export default function TelefoneScreen() {
  return (
    <View style={styles.container}>
      <Text>Tela app/config/telefone</Text>
      <Pressable onPress={() => router.back()}>
        <Text>Voltar</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0cc',
    alignItems: 'center',
    justifyContent: 'center',
  },
});