import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader, GlassCard, Screen, SearchField } from '../../components';
import { colors, radii, spacing, type } from '../../theme';

const allDecks = [
  { name: 'Sliver Overlord', cards: 100, image: require('../../assets/yugioh-back.jpg') },
  { name: 'Blue Counterspell', cards: 60, image: require('../../assets/yugioh-back.jpg') },
  { name: 'Goblins Aggro', cards: 60, image: require('../../assets/pokemon-back.jpg') },
  { name: 'DECK SUPREMO', cards: 100, image: require('../../assets/pokemon-back.jpg') },
  { name: 'Sliver Overlord', cards: 100, image: require('../../assets/yugioh-back.jpg') },
  { name: 'Blue Counterspell', cards: 60, image: require('../../assets/pokemon-back.jpg') },
  { name: 'Goblins Aggro', cards: 60, image: require('../../assets/pokemon-back.jpg') },
  { name: 'Selesnya Lifegain', cards: 100, image: require('../../assets/yugioh-back.jpg') },
];

function useDeckSearch(query) {
  return useMemo(
    () => allDecks.filter((deck) => deck.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );
}

export default function Buscar() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const decks = useDeckSearch(query);

  return (
    <Screen>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader tagline={t('buscar_decks')} style={styles.header} />

        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder={t('buscar_decks')}
          style={styles.search}
        />

        <View style={styles.deckGrid}>
          {decks.map((deck, index) => (
            <GlassCard
              key={`${deck.name}-${index}`}
              onPress={() => router.push({ pathname: '/decks', params: { source: 'buscar' } })}
              style={styles.deckCard}
            >
              <View style={styles.imageFrame}>
                <Image source={deck.image} style={styles.deckImage} resizeMode="cover" />
                <View pointerEvents="none" style={styles.imageVeil} />
              </View>
              <Text style={styles.deckName} numberOfLines={1}>{deck.name}</Text>
              <Text style={styles.cardCount}>
                {deck.cards}
                {' '}
                {t(deck.cards === 1 ? 'carta' : 'cartas').toLowerCase()}
              </Text>
            </GlassCard>
          ))}
        </View>

        {decks.length === 0 && <Text style={styles.emptyText}>{t('nenhum_deck_encontrado')}</Text>}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: spacing.lg },
  header: { marginBottom: spacing.lg },
  search: { marginHorizontal: spacing.gutter, marginBottom: spacing.lg },
  deckGrid: {
    paddingHorizontal: spacing.gutter,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  deckCard: { width: '48%', gap: 2 },
  imageFrame: {
    height: 96,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.bgDeepest,
    marginBottom: spacing.xs,
  },
  deckImage: { width: '100%', height: '100%' },
  imageVeil: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  deckName: { ...type.titleMd, color: colors.textPrimary },
  cardCount: { ...type.bodySm, color: colors.textSecondary },
  emptyText: {
    ...type.bodyMd,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
