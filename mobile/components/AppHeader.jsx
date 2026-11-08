import { Pressable, StyleSheet, Text, View } from 'react-native';
import Logo from './Logo';
import { colors, radii, shadows, sizes, spacing, type } from '../theme';

/**
 * Cabeçalho único do app. Toda página passa por aqui, então o logo e o nome
 * "Deck-it" aparecem sempre — só muda o arranjo.
 *
 * variant="brand" (padrão)
 *   [ logo  Deck-it            ]   ← telas de nível raiz (Home, Busca, Perfil)
 *   [       tagline            ]
 *
 * variant="page"
 *   [ ‹  Título da página   logo Deck-it ]  ← telas internas com voltar
 *
 * @param {'brand'|'page'} variant
 * @param {string}   title     título da página (variant="page")
 * @param {string}   tagline   subtítulo da marca (variant="brand")
 * @param {Function} onBack    se definido, mostra o botão voltar
 * @param {Node}     right     slot opcional à direita (ações da página)
 */
export default function AppHeader({
  variant = 'brand',
  title,
  tagline,
  onBack,
  right,
  style,
}) {
  const isPage = variant === 'page';

  return (
    <View style={[styles.header, style]}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={8}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
      ) : null}

      {isPage ? (
        <>
          <Text style={styles.pageTitle} numberOfLines={1}>
            {title}
          </Text>
          <Logo size={22} withWordmark wordmarkSize={13} glow={false} style={styles.compactBrand} />
        </>
      ) : (
        <>
          <Logo size={34} withWordmark tagline={tagline} />
          <View style={styles.spacer} />
        </>
      )}

      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: sizes.header,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.glassHeader,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.elevated,
  },
  spacer: { flex: 1 },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.6 },
  backIcon: {
    color: colors.textPrimary,
    fontSize: 26,
    lineHeight: 28,
    marginTop: -3,
  },
  pageTitle: {
    ...type.headlineSm,
    color: colors.textPrimary,
    flex: 1,
  },
  compactBrand: { opacity: 0.9 },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
});
