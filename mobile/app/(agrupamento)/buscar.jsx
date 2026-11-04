import { router } from 'expo-router';
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header} />
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            placeholder={t('buscar_decks')}
            placeholderTextColor="#8588b3"
            returnKeyType="search"
          />
        </View>

        <View style={styles.deckGrid}>
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
              </View>
              <Text style={styles.deckName} numberOfLines={1}>{deck.name}</Text>
              <Text style={styles.cardCount}>
                {deck._count?.items ?? 0}
                {' '}
                {t((deck._count?.items ?? 0) === 1 ? 'carta' : 'cartas').toLowerCase()}
              </Text>
            </Pressable>
          ))}
        </View>
        {isLoading ? <Text style={styles.emptyText}>{t('carregando')}</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {!isLoading && !error && decks.length === 0 ? (
          <Text style={styles.emptyText}>{t('nenhum_deck_encontrado')}</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#101126' },
  screen: { flex: 1, backgroundColor: '#101126' },
  content: { paddingBottom: 24 },
  header: {
    height: 43,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#292d62',
  },
  searchBox: {
    height: 36,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 30,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#292d62',
    borderRadius: 7,
  },
  searchIcon: { color: '#a2a5cf', fontSize: 22, marginRight: 5 },
  searchInput: { flex: 1, color: '#f4f4fb', fontSize: 12, padding: 0 },
  deckGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 13,
  },
  deckCard: {
    width: '47%',
    height: 133,
    padding: 9,
    borderRadius: 9,
    backgroundColor: '#292d62',
    borderWidth: 1,
    borderColor: '#383e7b',
  },
  deckPressed: { opacity: 0.75 },
  imagePlaceholder: {
    height: 73,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#292d62',
    borderBottomWidth: 1,
    borderColor: '#383e7b',
  },
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