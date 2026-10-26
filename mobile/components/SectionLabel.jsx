import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, type } from '../theme';

/**
 * Rótulo de seção em caixa alta, com um slot opcional à direita
 * (ex.: "Cartas no Deck        + Adicionar cartas").
 */
export default function SectionLabel({ children, right, style }) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.label}>{children}</Text>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: { ...type.overline, color: colors.textSecondary },
  right: { flexDirection: 'row', alignItems: 'center' },
});
