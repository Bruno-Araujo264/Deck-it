import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing, type } from '../theme';

/**
 * Caixa de número em destaque (cartas no deck, valor estimado, nº da carta).
 *
 * @param {string} label rótulo em caixa alta
 * @param {string} value valor em destaque
 * @param {string} color cor do valor (padrão: ouro)
 */
export default function StatBox({ label, value, color = colors.gold, style }) {
  return (
    <View style={[styles.box, style]}>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      <Text style={[styles.value, { color }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    minHeight: 64,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  label: { ...type.overline, color: colors.textSecondary },
  value: { ...type.headlineMd },
});
