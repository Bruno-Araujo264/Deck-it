import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getDeckItems } from '../../api/client';
import {
  AppHeader,
  IconButton,
  Screen,
  SearchField,
  SectionLabel,
  StatBox,
} from '../../components';
import { colors, radii, shadows, spacing, type } from '../../theme';

export default function Decks() {
  const { t } = useTranslation();
  const { source, deckId } = useLocalSearchParams();
  const [deck, setDeck] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  function goBack() {
    const previousRoute = source === 'buscar' ? '/buscar' : source === 'adicionar' ? '/adicionar' : '/home';
    router.replace(previousRoute);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadDeck() {
      if (!deckId) {
        setError(t('deck_nao_selecionado'));
        setIsLoading(false);
        return;
      }

      try {
        const deckData = await getDeckItems(deckId);
        if (isMounted) {
          setDeck(deckData);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDeck();

    return () => {
      isMounted = false;
    };
  }, [deckId, t]);

  const cards = deck?.items ?? [];
  const totalCards = cards.reduce((total, item) => total + (item.quantity ?? 0), 0);

  return (
    <Screen>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          variant="page"
          title={deck?.name ?? t('decks')}
          onBack={goBack}
          right={<IconButton icon="↗" accessibilityLabel="Editar deck" iconStyle={styles.editIcon} />}
          style={styles.header}
        />

        <View style={styles.summary}>
          <StatBox label={t('cartas')} value={totalCards} />
          <StatBox label={t('jogo')} value={deck?.game?.name ?? '-'} color={colors.mtg} />
        </View>

        <SearchField
          placeholder={t('buscar_cartas')}
          style={styles.search}
        />

        <SectionLabel
          style={styles.cardsLabel}
          right={
            <Pressable onPress={() => router.push({
              pathname: '/adicionar',
              params: { deckId: String(deckId) },
            })} hitSlop={6}>
              <Text style={styles.addCard}>＋ {t('adicionar_cartas')}</Text>
            </Pressable>
          }
        >
          {t('cartas_no_deck')}
        </SectionLabel>

        <View style={styles.cardGrid}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {!isLoading && !error && cards.length === 0 ? (
            <Text style={styles.emptyText}>{t('nenhuma_carta_no_deck')}</Text>
          ) : null}
          {cards.map((item) => (
            <Pressable
              key={item.id}
              style={styles.cardItem}
              onPress={() => router.push({
                pathname: '/carta',
                params: {
                  externalId: item.cardExternalId,
                  gameId: deck?.game?.id ? String(deck.game.id) : undefined,
                },
              })}
            >
              {item.cardDetails?.imageNormal ? (
                <Image
                  source={{ uri: item.cardDetails.imageNormal }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <Text style={styles.placeholderText}>{t('imagem_indisponivel')}</Text>
                </View>
              )}
              <Text style={styles.cardName} numberOfLines={1}>
                {item.cardDetails?.name ?? item.cardExternalId}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: spacing.lg },
  header: { marginBottom: spacing.md },
  editIcon: { color: colors.gold, transform: [{ rotate: '-45deg' }] },
  summary: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.gutter,
  },
  search: { marginHorizontal: spacing.gutter, marginTop: spacing.md },
  cardsLabel: { marginHorizontal: spacing.gutter, marginTop: spacing.lg },
  addCard: { ...type.labelSm, color: colors.gold },
  cardGrid: {
    paddingHorizontal: spacing.gutter,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  cardItem: { width: '48%', alignItems: 'center' },
  cardPressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  cardFrame: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.bgDeepest,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardImagePlaceholder: {
    width: 150,
    height: 200,
    borderRadius: 2,
    backgroundColor: '#292d62',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { color: '#8588b3', fontSize: 9, textAlign: 'center' },
  errorText: { color: '#ff8f9c', fontSize: 11, textAlign: 'center', margin: 14 },
  emptyText: { color: '#8588b3', fontSize: 11, textAlign: 'center', margin: 20 },
  cardImage: { width: '100%', height: '100%' },
  cardName: {
    width: '100%',
    marginTop: spacing.xs,
    ...type.labelSm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
