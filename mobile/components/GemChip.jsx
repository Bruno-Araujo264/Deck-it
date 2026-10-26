import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, gameColor, radii, spacing, type } from '../theme';

/**
 * "Gema" de filtro por reino/jogo — losango brilhante + rótulo.
 * É o chip do protótipo (Filtrar por Reino).
 *
 * @param {string}  label  texto do chip
 * @param {string}  game   nome do jogo; define a cor da gema
 * @param {string}  color  sobrescreve a cor da gema
 * @param {boolean} active estado selecionado
 */
export default function GemChip({ label, game, color, active = false, onPress, style, ...rest }) {
  const gem = color || gameColor(game || label);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        active && { borderColor: `${gem}80` },
        pressed && styles.pressed,
        style,
      ]}
      {...rest}
    >
      <View
        style={[
          styles.gem,
          {
            backgroundColor: gem,
            shadowColor: gem,
          },
        ]}
      />
      <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  chipActive: {
    backgroundColor: colors.surfaceElevated,
  },
  pressed: { opacity: 0.75 },
  gem: {
    width: 12,
    height: 12,
    borderRadius: 3,
    transform: [{ rotate: '45deg' }],
    shadowOpacity: 0.9,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  label: { ...type.bodySm, color: colors.textSecondary },
  labelActive: { color: colors.textPrimary, fontFamily: fonts.bodySemiBold },
});
