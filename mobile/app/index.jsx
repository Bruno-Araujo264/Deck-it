import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.brandArea}>
          <View style={styles.logo} accessibilityLabel="Deck-it">
            <View style={[styles.logoWing, styles.logoWingLeft]} />
            <View style={[styles.logoWing, styles.logoWingRight]} />
            <View style={styles.logoCenter} />
          </View>
          <Text style={styles.brandName}>Deck-It</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.enterButton, pressed && styles.enterButtonPressed]}
          onPress={() => router.push('/login')}
          accessibilityRole="button"
        >
          <Text style={styles.enterText}>Entrar</Text>
        </Pressable>

        <Text style={styles.copyright}>© - Direitos Autorais Absolum Idum Opus</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#101126',
  },
  container: {
    flex: 1,
    backgroundColor: '#101126',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  brandArea: {
    alignItems: 'center',
    marginTop: 126,
  },
  logo: {
    width: 178,
    height: 116,
    position: 'relative',
  },
  logoWing: {
    position: 'absolute',
    top: 10,
    width: 69,
    height: 96,
    backgroundColor: '#d9d9d9',
    borderWidth: 4,
    borderColor: '#050509',
  },
  logoWingLeft: {
    left: 5,
    borderRadius: 25,
    transform: [{ rotate: '-25deg' }],
  },
  logoWingRight: {
    right: 5,
    borderRadius: 25,
    transform: [{ rotate: '25deg' }],
  },
  logoCenter: {
    position: 'absolute',
    left: 51,
    top: 0,
    width: 76,
    height: 111,
    borderRadius: 25,
    backgroundColor: '#d9d9d9',
    borderWidth: 4,
    borderColor: '#050509',
  },
  brandName: {
    color: '#eeeeF4',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 15,
  },
  enterButton: {
    minWidth: 125,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#292d62',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 191,
    borderWidth: 1,
    borderColor: '#343875',
  },
  enterButtonPressed: {
    backgroundColor: '#363b79',
  },
  enterText: {
    color: '#eeeeF4',
    fontSize: 28,
    fontWeight: '700',
  },
  copyright: {
    color: '#8588b3',
    fontSize: 8,
    position: 'absolute',
    bottom: 15,
  },
});