import { router } from 'expo-router';
import {View, Text, StyleSheet, Pressable} from 'react-native';

export default function Adicionar() {
  return (
    <View style={styles.container}>
      <Text>SOU UM EXEMPLO</Text>
      <Pressable onPress={() => router.back()}>
        <Text>Voltar</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2df',
    alignItems: 'center',
    justifyContent: 'center',
  },
});