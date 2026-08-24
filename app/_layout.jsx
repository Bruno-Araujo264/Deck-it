import { Slot } from 'expo-router';
import { View, StyleSheet, Text } from 'react-native';

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>LAYOUTTTT</Text>
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#aaa'
  },
  titulo: {
    paddingTOp: 20,
    paddingBottom: 20,
    fontSize: 20,
    fontWeight: 'bold'
  },
});