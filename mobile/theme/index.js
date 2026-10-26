/**
 * Deck-it — ponto único de entrada do tema.
 *
 *   import { colors, type, spacing, radii, shadows } from '../theme';
 */
export { colors, gradients, gameColor, gameColors, default as palette } from './colors';
export { type, fonts, fontAssets } from './typography';
export { spacing, radii, sizes, shadows, gameGlow } from './layout';

import { colors } from './colors';
import { type } from './typography';
import { spacing, radii, sizes, shadows } from './layout';

export const theme = { colors, type, spacing, radii, sizes, shadows };
export default theme;
