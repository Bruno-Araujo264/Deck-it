/**
 * Deck-it — Design Tokens: espaçamento, raios, sombras e glows.
 */
import { Platform } from 'react-native';
import { colors } from './colors';

/** Escala de espaçamento (múltiplos de 4). */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  /** Respiro horizontal padrão das telas. */
  gutter: 16,
};

/** Raios de canto — o protótipo é bem arredondado. */
export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  pill: 999,
};

/** Alturas fixas de elementos recorrentes. */
export const sizes = {
  header: 60,
  tabBar: 76,
  field: 46,
  button: 48,
  buttonSm: 40,
  iconButton: 38,
};

/**
 * Sombras e glows.
 *
 * O guia troca sombras pretas opacas por glows coloridos. No React Native,
 * iOS usa shadow* e Android usa elevation, então cada preset entrega os dois.
 */
function shadow({ color, opacity, radius, offsetY = 0, elevation = 0 }) {
  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: offsetY },
    },
    android: { elevation, shadowColor: color },
    default: {
      shadowColor: color,
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: offsetY },
    },
  });
}

export const shadows = {
  /** Superfície padrão de vidro (cards, sheets). */
  card: shadow({ color: '#0A061E', opacity: 0.45, radius: 16, offsetY: 8, elevation: 6 }),
  /** Superfície elevada (modais, header). */
  elevated: shadow({ color: '#0A061E', opacity: 0.6, radius: 20, offsetY: 12, elevation: 12 }),
  /** Aura dourada do CTA primário / orbe do scanner. */
  gold: shadow({ color: colors.gold, opacity: 0.55, radius: 14, offsetY: 0, elevation: 10 }),
  /** Glow ciano do scanner. */
  cyan: shadow({ color: colors.scannerCyan, opacity: 0.5, radius: 14, offsetY: 0, elevation: 8 }),
  /** Sem sombra. */
  none: Platform.select({ android: { elevation: 0 }, default: { shadowOpacity: 0 } }),
};

/** Glow temático por franquia de TCG (usado na borda/sombra dos cards). */
export function gameGlow(color) {
  return shadow({ color, opacity: 0.38, radius: 12, offsetY: 0, elevation: 8 });
}

export default { spacing, radii, sizes, shadows, gameGlow };
