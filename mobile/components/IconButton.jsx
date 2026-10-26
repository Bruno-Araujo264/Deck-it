import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radii, sizes, type } from '../theme';

/**
 * Botão circular/quadrado só com glifo — ações secundárias do header
 * e de cards (editar, mais opções, etc.).
 */
export default function IconButton({
  icon,
  onPress,
  color = colors.textPrimary,
  size = sizes.iconButton,
  tone = 'glass',
  style,
  iconStyle,
  ...rest
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      hitSlop={6}
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size, borderRadius: radii.sm },
        tone === 'glass' ? styles.glass : styles.bare,
        pressed && styles.pressed,
        style,
      ]}
      {...rest}
    >
      <Text style={[styles.icon, { color }, iconStyle]}>{icon}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center' },
  glass: {
    backgroundColor: colors.glassElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bare: { backgroundColor: colors.transparent },
  pressed: { opacity: 0.6 },
  icon: { ...type.titleMd, fontFamily: fonts.body },
});
