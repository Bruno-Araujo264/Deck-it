/**
 * Deck-it — Design Tokens: Tipografia
 *
 * Três famílias, como pedem a Paleta.html e os protótipos:
 *   · Cinzel      → a marca e os rótulos cerimoniais (serifada capitular)
 *   · EB Garamond → títulos de conteúdo (nome de deck, nome de carta)
 *   · Quicksand   → todo o corpo de texto e rótulos de interface
 *
 * No React Native cada peso é uma família separada, então os tokens abaixo
 * trazem `fontFamily` explícito e NÃO usam `fontWeight` — pedir negrito por
 * cima de uma fonte já negrita gera o "fake bold" borrado do Android.
 *
 * As fontes são carregadas em `app/_layout.jsx` com `useFonts`. Enquanto não
 * terminam de carregar o app não renderiza, então aqui pode-se assumir que
 * estão disponíveis.
 */

export const fonts = {
  // Cinzel — marca e caixa alta
  brand: 'Cinzel_700Bold',
  brandMedium: 'Cinzel_500Medium',

  // EB Garamond — títulos de conteúdo
  heading: 'EBGaramond_600SemiBold',
  headingMedium: 'EBGaramond_500Medium',

  // Quicksand — interface
  body: 'Quicksand_400Regular',
  bodyMedium: 'Quicksand_500Medium',
  bodySemiBold: 'Quicksand_600SemiBold',
  bodyBold: 'Quicksand_700Bold',
};

/**
 * Mapa que o `useFonts` do _layout consome. Mantenha-o em sincronia com
 * `fonts` acima: cada valor de `fonts` precisa de uma entrada aqui.
 */
export const fontAssets = {
  Cinzel_500Medium: require('@expo-google-fonts/cinzel/500Medium/Cinzel_500Medium.ttf'),
  Cinzel_700Bold: require('@expo-google-fonts/cinzel/700Bold/Cinzel_700Bold.ttf'),
  EBGaramond_500Medium: require('@expo-google-fonts/eb-garamond/500Medium/EBGaramond_500Medium.ttf'),
  EBGaramond_600SemiBold: require('@expo-google-fonts/eb-garamond/600SemiBold/EBGaramond_600SemiBold.ttf'),
  Quicksand_400Regular: require('@expo-google-fonts/quicksand/400Regular/Quicksand_400Regular.ttf'),
  Quicksand_500Medium: require('@expo-google-fonts/quicksand/500Medium/Quicksand_500Medium.ttf'),
  Quicksand_600SemiBold: require('@expo-google-fonts/quicksand/600SemiBold/Quicksand_600SemiBold.ttf'),
  Quicksand_700Bold: require('@expo-google-fonts/quicksand/700Bold/Quicksand_700Bold.ttf'),
};

/** Escala tipográfica (espelha a escala Material dos protótipos). */
export const type = {
  /** Nome do app, títulos cerimoniais. Cinzel. */
  brandLg: { fontFamily: fonts.brand, fontSize: 34, lineHeight: 42, letterSpacing: 1 },
  brandMd: { fontFamily: fonts.brand, fontSize: 22, lineHeight: 28, letterSpacing: 0.8 },
  brandSm: { fontFamily: fonts.brand, fontSize: 14, lineHeight: 18, letterSpacing: 0.6 },

  /** Títulos de conteúdo. EB Garamond. */
  displayLg: { fontFamily: fonts.heading, fontSize: 32, lineHeight: 40 },
  headlineLg: { fontFamily: fonts.heading, fontSize: 26, lineHeight: 34 },
  headlineMd: { fontFamily: fonts.heading, fontSize: 21, lineHeight: 28 },
  headlineSm: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 24 },

  /** Interface. Quicksand. */
  titleLg: { fontFamily: fonts.bodyBold, fontSize: 18, lineHeight: 26 },
  titleMd: { fontFamily: fonts.bodySemiBold, fontSize: 15, lineHeight: 22 },

  bodyLg: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  bodyMd: { fontFamily: fonts.body, fontSize: 13, lineHeight: 20 },
  bodySm: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },

  labelLg: { fontFamily: fonts.bodySemiBold, fontSize: 14, lineHeight: 20, letterSpacing: 0.2 },
  labelMd: { fontFamily: fonts.bodySemiBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.3 },
  labelSm: { fontFamily: fonts.bodyMedium, fontSize: 10, lineHeight: 14, letterSpacing: 0.4 },

  /** Rótulo de seção em caixa alta, espaçado — Cinzel, acima de cada bloco. */
  overline: {
    fontFamily: fonts.brandMedium,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
};

export default type;
