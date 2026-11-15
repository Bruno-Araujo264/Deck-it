import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader, Button, GlassCard, Screen, SearchField } from '../components';
import { colors, radii, spacing, type } from '../theme';
import { addCardToDeck, getCards } from '../api/client';

function cleanCardName(name) {
  return String(name ?? '').replace(/^[^\p{L}]*/u, '');
}

export default function SelecionarCarta() {
  const { t } = useTranslation();
  const { deckId, gameId } = useLocalSearchParams();
  const [query, setQuery] = useState('');
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingCardId, setAddingCardId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadCards() {
      setIsLoading(true);
      setError('');
      try {
        const result = await getCards({ name: query, gameId });
        if (isMounted) {
          setCards(result.data ?? []);
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

    loadCards();

    return () => {
      isMounted = false;
    };
  }, [gameId, query]);

  async function handleAddCard(card) {
    if (!deckId) {
      setError(t('deck_nao_selecionado'));
      return;
    }

    setAddingCardId(card.externalId);
    setError('');
    try {
      await addCardToDeck(deckId, card.externalId);
      router.replace({
        pathname: '/decks',
        params: { deckId: String(deckId), source: 'adicionar' },
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setAddingCardId('');
    }
  }

  return (
    <Screen>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          variant="page"
          title={t('escolher_carta_existente')}
          onBack={() => router.back()}
          style={styles.header}
        />

        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder={t('buscar_cartas')}
          autoCapitalize="none"
          style={styles.search}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {isLoading ? <Text style={styles.statusText}>{t('carregando')}</Text> : null}
        {!isLoading && !error && cards.length === 0 ? (
          <Text style={styles.emptyText}>{t('nenhuma_carta_encontrada')}</Text>
        ) : null}

        <View style={styles.cardGrid}>
          {cards.map((card) => (
            <GlassCard key={card.externalId} style={styles.cardItem}>
              <View style={styles.imageFrame}>
                {card.imageNormal ? (
                  <Image
                    source={{ uri: card.imageNormal }}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.placeholderText}>{t('imagem_indisponivel')}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardName} numberOfLines={2}>
                {cleanCardName(card.name)}
              </Text>
              <Button
                label={addingCardId === card.externalId ? t('carregando') : t('adicionar')}
                size="sm"
                full
                disabled={addingCardId === card.externalId}
                onPress={() => handleAddCard(card)}
                style={styles.addButton}
              />
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: spacing.lg },
  header: { marginBottom: spacing.lg },
  search: { marginHorizontal: spacing.gutter, marginBottom: spacing.lg },
  errorText: {
    ...type.bodySm,
    color: colors.danger,
    textAlign: 'center',
    marginHorizontal: spacing.gutter,
    marginBottom: spacing.sm,
  },
  statusText: {
    ...type.bodyMd,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    ...type.bodyMd,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  cardGrid: {
    paddingHorizontal: spacing.gutter,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  cardItem: { width: '48%', gap: spacing.xxs },
  imageFrame: {
    height: 125,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.bgDeepest,
    marginBottom: spacing.xxs,
  },
  cardImage: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgDeepest,
  },
  placeholderText: { ...type.labelSm, color: colors.textMuted, textAlign: 'center' },
  cardName: { ...type.titleMd, color: colors.textPrimary, minHeight: 40 },
  addButton: { marginTop: spacing.xs },
});
