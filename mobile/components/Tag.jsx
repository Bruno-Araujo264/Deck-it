import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, type } from '../theme';

/**
 * Selo pequeno: raridade, jogo, status.
 *
 * @param {string}  color     cor do texto/borda (padrão: lavanda)
 * @param {boolean} highlight preenche o fundo com a cor (selo sólido)
 */
export default function Tag({ label, color = colors.lavender, highlight = false, style }) {
  return (
    <View
      style={[
        styles.tag,
        highlight
          ? { backgroundColor: color, borderColor: color }
          : { backgroundColor: colors.surfaceHighest, borderColor: `${color}44` },
        style,
      ]}
    >
      <Text style={[styles.text, { color: highlight ? colors.textOnLight : color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  text: { ...type.labelSm },
});
