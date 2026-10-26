import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} accessibilityRole="button">
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>{t('escolher_carta_existente')}</Text>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            placeholder={t('buscar_cartas')}
            placeholderTextColor="#8588b3"
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {isLoading ? <Text style={styles.statusText}>{t('carregando')}</Text> : null}
        {!isLoading && !error && cards.length === 0 ? (
          <Text style={styles.emptyText}>{t('nenhuma_carta_encontrada')}</Text>
        ) : null}

        <View style={styles.cardGrid}>
          {cards.map((card) => (
            <View key={card.externalId} style={styles.cardItem}>
              {card.imageNormal ? (
                <Image source={{ uri: card.imageNormal }} style={styles.cardImage} resizeMode="contain" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.placeholderText}>{t('imagem_indisponivel')}</Text>
                </View>
              )}
              <Text style={styles.cardName} numberOfLines={2}>
                {cleanCardName(card.name)}
              </Text>
              <Pressable
                style={styles.addButton}
                onPress={() => handleAddCard(card)}
                disabled={addingCardId === card.externalId}
              >
                <Text style={styles.addButtonText}>
                  {addingCardId === card.externalId ? t('carregando') : t('adicionar')}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#101126' },
  screen: { flex: 1, backgroundColor: '#101126' },
  content: { paddingBottom: 24 },
  header: {
    height: 44,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#292d62',
  },
  backIcon: { color: '#d7d8ea', fontSize: 27, lineHeight: 25, marginRight: 9 },
  title: { color: '#f4f4fb', fontSize: 14, fontWeight: '800' },
  searchBox: {
    height: 36,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 20,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#292d62',
    borderRadius: 7,
  },
  searchIcon: { color: '#a2a5cf', fontSize: 22, marginRight: 5 },
  searchInput: { flex: 1, color: '#f4f4fb', fontSize: 12, padding: 0 },
  cardGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 13,
  },
  cardItem: {
    width: '47%',
    minHeight: 190,
    padding: 9,
    borderRadius: 9,
    backgroundColor: '#292d62',
    borderWidth: 1,
    borderColor: '#383e7b',
  },
  cardImage: { width: '100%', height: 125 },
  imagePlaceholder: {
    height: 125,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#20234d',
  },
  placeholderText: { color: '#8588b3', fontSize: 10, textAlign: 'center' },
  cardName: { color: '#f4f4fb', fontSize: 11, fontWeight: '700', marginTop: 7 },
  addButton: {
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#625ff0',
  },
  addButtonText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  statusText: { color: '#8588b3', textAlign: 'center', marginBottom: 16, fontSize: 12 },
  emptyText: { color: '#8588b3', textAlign: 'center', marginTop: 25, fontSize: 12 },
  errorText: { color: '#ff8f9b', textAlign: 'center', marginHorizontal: 16, marginBottom: 14, fontSize: 12 },
});
