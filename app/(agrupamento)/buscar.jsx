import { router } from 'expo-router';
import {View, Text, StyleSheet, Pressable} from 'react-native';

export default function Buscar() {
  return (
    <View style={styles.container}>
      <Text>Pesquisar Decks</Text>
      <Pressable onPress={() => router.back()}>
        <Text>Voltar</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcc',
    alignItems: 'center',
    justifyContent: 'center',
  },
});