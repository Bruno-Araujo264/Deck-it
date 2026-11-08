import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, gradients, radii, shadows, sizes, spacing, type } from '../theme';

/**
 * Botão do Deck-it.
 *
 * variant:
 *   · primary   → Resplendor Dourado Solar (gradiente 135°) com aura
 *   · secondary → vidro ametista elevado
 *   · outline   → contorno dourado sobre fundo transparente
 *   · ghost     → só texto
 *   · danger    → ações destrutivas
 *
 * size: 'md' (padrão) | 'sm'
 */
export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  full = false,
  disabled = false,
  style,
  textStyle,
  ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const small = size === 'sm';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        { height: small ? sizes.buttonSm : sizes.button },
        v.container,
        full && styles.full,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
      {...rest}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={gradients.gold}
          locations={[0, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}

      <View style={styles.content} pointerEvents="none">
        {icon ? <Text style={[styles.icon, v.text]}>{icon}</Text> : null}
        <Text style={[small ? type.labelMd : type.labelLg, v.text, textStyle]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  full: { alignSelf: 'stretch' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.45 },
  icon: { fontSize: 16 },
});

const VARIANTS = {
  primary: {
    container: [{ backgroundColor: colors.gold }, shadows.gold],
    text: { color: colors.textOnLight, fontFamily: fonts.bodyBold },
  },
  secondary: {
    container: [
      {
        backgroundColor: colors.glassElevated,
        borderWidth: 1,
        borderColor: colors.borderStrong,
      },
      shadows.card,
    ],
    text: { color: colors.textPrimary },
  },
  outline: {
    container: [
      {
        backgroundColor: colors.transparent,
        borderWidth: 1,
        borderColor: colors.gold,
      },
    ],
    text: { color: colors.gold },
  },
  ghost: {
    container: [{ backgroundColor: colors.transparent }],
    text: { color: colors.textSecondary },
  },
  danger: {
    container: [
      {
        backgroundColor: colors.transparent,
        borderWidth: 1,
        borderColor: colors.danger,
      },
    ],
    text: { color: colors.danger },
  },
};
