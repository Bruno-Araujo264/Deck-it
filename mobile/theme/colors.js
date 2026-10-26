/**
 * Deck-it — Design Tokens: Cores
 *
 * Fonte da verdade: Paleta.html (Guia de Estilo & Paleta de Cores — Deck-it).
 * Qualquer cor usada no app deve sair daqui. Nunca escreva hexadecimais
 * soltos nas telas.
 */

export const colors = {
  // --- Base estrutural (fundo) ---
  bgNight: '#14103A', // --bg-night   · topo do gradiente de fundo
  bgDeep: '#130D34', // fundo dos protótipos (surface)
  bgDeepest: '#0E072E', // surface-container-lowest
  deepViolet: '#2A1A63', // --bg-deep-violet · base do gradiente / texto sobre ouro

  // --- Superfícies ---
  surface: '#1C163C', // surface-container-low
  surfaceAmethyst: '#221A55', // --surface-amethyst · cards, sheets, inputs
  surfaceElevated: '#2D2370', // ametista elevada · hover, chips ativos
  surfaceHigh: '#2A244C', // surface-container-high
  surfaceHighest: '#352F57', // surface-container-highest
  surfaceBright: '#3A345C',

  // --- Marca / ação ---
  gold: '#FFD166', // --primary-gold · CTAs, orbe do scanner
  goldLight: '#FFE58F', // início do gradiente dourado
  goldDeep: '#E0A838', // fim do gradiente dourado
  goldDim: '#EDC157', // primary-fixed-dim

  // --- Tipografia ---
  textPrimary: '#F5F1FF', // Névoa Mística
  textOnLight: '#2A1A63', // texto sobre superfícies douradas (WCAG AA)
  textSecondary: '#B8B0E0', // Lavanda Mágica
  textMuted: '#8B82B8', // lavanda rebaixada, metadados
  lavender: '#CABEFF', // secondary / secondary-fixed-dim

  // --- Destaques ---
  pink: '#FF5FA2', // Rosa Poção · badges "mais recente"

  // --- Identidade dos jogos (gemas) ---
  mtg: '#FF6B4A', // Rubi Flamejante
  pokemon: '#FFC93C', // Âmbar Elétrico
  yugioh: '#A86BFF', // Ametista Milenar
  lorcana: '#3EE7F2', // sem gema oficial · reaproveita o ciano

  // --- Estados do scanner & feedback ---
  scannerCyan: '#3EE7F2', // Ciano Laser
  success: '#34D399', // Esmeralda
  danger: '#FF4D6D', // Rubi Erro

  // --- Bordas / divisores ---
  border: 'rgba(255, 255, 255, 0.14)',
  borderStrong: 'rgba(255, 255, 255, 0.20)',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',

  // --- Halo radial do fundo ---
  haloCore: 'rgba(80, 54, 168, 0.55)',
  haloFade: 'rgba(42, 26, 99, 0)',

  // --- Véus translúcidos (glassmorphism) ---
  glass: 'rgba(34, 26, 85, 0.65)', // vidro ametista padrão
  glassElevated: 'rgba(45, 35, 112, 0.75)', // vidro elevado
  glassHeader: 'rgba(34, 26, 85, 0.88)', // header fixo
  glassNav: 'rgba(32, 26, 64, 0.92)', // bottom nav
  scrim: 'rgba(14, 7, 46, 0.6)',

  transparent: 'transparent',
};

/**
 * Gradientes do guia de estilo, no formato que o `expo-linear-gradient`
 * espera. Use junto com os `start`/`end` indicados no comentário.
 */
export const gradients = {
  /** Fundo global — vertical (start {0.5,0} → end {0.5,1}). */
  backdrop: [colors.bgNight, colors.deepViolet],
  /** Resplendor Dourado Solar — 135° (start {0,0} → end {1,1}). */
  gold: [colors.goldLight, colors.gold, colors.goldDeep],
  /** Linha de varredura do scanner — horizontal (start {0,0.5} → end {1,0.5}). */
  scanLine: ['rgba(62, 231, 242, 0)', 'rgba(62, 231, 242, 0.95)', 'rgba(62, 231, 242, 0)'],
  /** Reserva de Mana / cache offline — horizontal. */
  mana: [colors.scannerCyan, colors.success, '#7C5CFF'],
};

/** Cor da gema correspondente a cada jogo de TCG. */
export const gameColors = {
  magic: colors.mtg,
  'magic: the gathering': colors.mtg,
  mtg: colors.mtg,
  pokemon: colors.pokemon,
  'pokémon': colors.pokemon,
  yugioh: colors.yugioh,
  'yu-gi-oh': colors.yugioh,
  'yu-gi-oh!': colors.yugioh,
  lorcana: colors.lorcana,
};

/**
 * Devolve a cor de gema de um jogo, com fallback para o lavanda da marca.
 * @param {string} game nome do jogo, em qualquer caixa
 */
export function gameColor(game) {
  if (!game) return colors.lavender;
  return gameColors[String(game).toLowerCase().trim()] || colors.lavender;
}

export default colors;
