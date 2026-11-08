import { router } from 'expo-router';
<<<<<<< HEAD
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
=======
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getDecks } from '../../api/client';
>>>>>>> origin/dev

export default function Buscar() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [allDecks, setAllDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadDecks() {
      try {
        const userDecks = await getDecks();
        if (isMounted) {
          setAllDecks(userDecks);
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

    loadDecks();

    return () => {
      isMounted = false;
    };
  }, []);

  const decks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allDecks.filter((deck) => deck.name.toLowerCase().includes(normalizedQuery));
  }, [allDecks, query]);

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
<<<<<<< HEAD
          {decks.map((deck, index) => (
            <GlassCard
              key={`${deck.name}-${index}`}
              onPress={() => router.push({ pathname: '/decks', params: { source: 'buscar' } })}
              style={styles.deckCard}
            >
              <View style={styles.imageFrame}>
                <Image source={deck.image} style={styles.deckImage} resizeMode="cover" />
                <View pointerEvents="none" style={styles.imageVeil} />
=======
          {decks.map((deck) => (
            <Pressable
              key={deck.id}
              style={({ pressed }) => [styles.deckCard, pressed && styles.deckPressed]}
              onPress={() => router.push({
                pathname: '/decks',
                params: { source: 'buscar', deckId: String(deck.id) },
              })}
            >
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imageLabel}>DECK</Text>
>>>>>>> origin/dev
              </View>
              <Text style={styles.deckName} numberOfLines={1}>{deck.name}</Text>
              <Text style={styles.cardCount}>
                {deck._count?.items ?? 0}
                {' '}
                {t((deck._count?.items ?? 0) === 1 ? 'carta' : 'cartas').toLowerCase()}
              </Text>
            </GlassCard>
          ))}
        </View>
<<<<<<< HEAD

        {decks.length === 0 && <Text style={styles.emptyText}>{t('nenhum_deck_encontrado')}</Text>}
=======
        {isLoading ? <Text style={styles.emptyText}>{t('carregando')}</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {!isLoading && !error && decks.length === 0 ? (
          <Text style={styles.emptyText}>{t('nenhum_deck_encontrado')}</Text>
        ) : null}
>>>>>>> origin/dev
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
<<<<<<< HEAD
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
=======
  imageLabel: { color: '#8588b3', fontSize: 10, fontWeight: '700' },
  deckImage: {
    width: '100%',
    height: '100%',
  },
  deckName: { color: '#f4f4fb', fontSize: 12, fontWeight: '700', marginTop: 8 },
  cardCount: { color: '#8588b3', fontSize: 10, marginTop: 3 },
  emptyText: { color: '#8588b3', textAlign: 'center', marginTop: 25, fontSize: 12 },
  errorText: { color: '#ff8f9b', textAlign: 'center', marginTop: 25, fontSize: 12 },
});
>>>>>>> origin/dev
