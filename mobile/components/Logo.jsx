import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, type, spacing } from '../theme';

const LOGO = require('../assets/deckit-logo.png');

/**
 * Marca do Deck-it.
 *
 * <Logo size={32} />                      → só o símbolo
 * <Logo size={32} withWordmark />         → símbolo + "Deck-it"
 * <Logo size={56} withWordmark tagline="Mesa Encantada TCG" />
 *
 * @param {number}  size        altura do símbolo em px (padrão 32)
 * @param {boolean} withWordmark exibe o nome do app ao lado
 * @param {string}  tagline     subtítulo em caixa alta sob o nome
 * @param {boolean} stacked     empilha símbolo e nome em coluna (telas de marca)
 * @param {boolean} glow        aura dourada em volta do símbolo
 */
export default function Logo({
  size = 32,
  withWordmark = false,
  tagline,
  stacked = false,
  glow = true,
  wordmarkSize,
  style,
}) {
  const symbolSize = { width: size * (596 / 658), height: size };
  const nameStyle = wordmarkSize ? { fontSize: wordmarkSize, lineHeight: wordmarkSize * 1.2 } : null;

  const symbol = (
    <View style={[styles.symbolWrap, glow && styles.symbolGlow, { borderRadius: size / 3 }]}>
      <Image source={LOGO} style={symbolSize} resizeMode="contain" accessibilityLabel="Deck-it" />
    </View>
  );

  if (!withWordmark) return <View style={style}>{symbol}</View>;

  return (
    <View style={[stacked ? styles.stacked : styles.inline, style]}>
      {symbol}
      <View style={stacked ? styles.wordmarkStacked : styles.wordmark}>
        <Text style={[styles.name, nameStyle]}>Deck-it</Text>
        {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  stacked: { alignItems: 'center', gap: spacing.sm },
  symbolWrap: { alignItems: 'center', justifyContent: 'center' },
  symbolGlow: {
    shadowColor: colors.scannerCyan,
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  wordmark: { justifyContent: 'center' },
  wordmarkStacked: { alignItems: 'center' },
  name: {
    ...type.brandMd,
    color: colors.gold,
  },
  tagline: {
    ...type.overline,
    color: colors.textSecondary,
    opacity: 0.75,
    marginTop: 2,
  },
});
