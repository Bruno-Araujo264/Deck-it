import { Pressable, StyleSheet, View } from 'react-native';
import { colors, gameGlow, radii, shadows, spacing } from '../theme';

/**
 * Superfície de vidro ametista — card de deck, bloco de ajustes, modal.
 *
 * @param {boolean} elevated  usa o vidro mais claro (hover/destaque)
 * @param {string}  glowColor glow temático (cor da gema do jogo)
 * @param {Function} onPress  se definido, vira um Pressable
 */
export default function GlassCard({
  children,
  elevated = false,
  glowColor,
  onPress,
  style,
  contentStyle,
  ...rest
}) {
  const base = [
    styles.card,
    elevated ? styles.elevated : null,
    glowColor ? [gameGlow(glowColor), { borderColor: `${glowColor}55` }] : shadows.card,
    style,
  ];

  if (!onPress) {
    return (
      <View style={base} {...rest}>
        {children}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [...base, pressed && styles.pressed, contentStyle]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  elevated: {
    backgroundColor: colors.glassElevated,
    borderColor: colors.borderStrong,
  },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
