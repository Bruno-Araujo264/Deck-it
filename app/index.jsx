import { Link } from 'expo-router';
import {View, Text, StyleSheet} from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Minha primeira tela</Text>
      <Link href="/sobre" style={styles.link}>Ir para app/sobre</Link>
      <Link href="/exemplo" style={styles.link}>Ir para app/exemplo</Link>
      <Link href="/config/wifi" style={styles.link}>Ir para app/config/wifi</Link>
      <Link href="/config/telefone" style={styles.link}>Ir para app/config/telefone</Link>
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