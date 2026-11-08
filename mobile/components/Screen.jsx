import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import ScreenBackground from './ScreenBackground';
import { colors } from '../theme';

/**
 * Casca padrão de todas as telas: fundo encantado + área segura + status bar
 * clara. Evita repetir `safeArea`/`backgroundColor` em cada StyleSheet.
 *
 * @param {string[]} edges  bordas seguras (padrão: topo)
 * @param {boolean}  stardust  poeira estelar no fundo
 */
export default function Screen({ children, edges = ['top'], stardust = true, style }) {
  return (
    <ScreenBackground stardust={stardust}>
      <StatusBar style="light" />
      <SafeAreaView style={[styles.safeArea, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.transparent },
});
