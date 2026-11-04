import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams } from 'expo-router';
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
import { getDeckItems } from '../../api/client';

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={goBack}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.deckTitle}>
            {isLoading ? t('carregando') : deck?.name ?? t('decks')}
          </Text>
          <Pressable style={styles.editButton} accessibilityLabel="Editar deck">
            <Text style={styles.editIcon}>↗</Text>
          </Pressable>
        </View>

        <View style={styles.deckSummary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('cartas')}</Text>
            <Text style={styles.summaryValue}>{totalCards}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('jogo')}</Text>
            <Text style={styles.summaryValue}>{deck?.game?.name ?? '-'}</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t('buscar_cartas')}
            placeholderTextColor="#8588b3"
          />
        </View>

        <View style={styles.cardsHeader}>
          <Text style={styles.sectionTitle}>{t('cartas_no_deck')}</Text>
          <Pressable
            onPress={() => router.push({
              pathname: '/adicionar',
              params: {
                deckId: String(deckId),
                gameId: deck?.game?.id ? String(deck.game.id) : undefined,
              },
            })}
          >
            <Text style={styles.addCard}>＋ {t('adicionar_cartas')}</Text>
          </Pressable>
        </View>

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
                  resizeMode="contain"
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
  deckTitle: { flex: 1, color: '#f4f4fb', fontSize: 14, fontWeight: '800' },
  editButton: {
    width: 22,
    height: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#292d62',
  },
  editIcon: { color: '#e3e4f1', fontSize: 16, transform: [{ rotate: '-45deg' }] },
  deckSummary: {
    height: 41,
    marginHorizontal: 13,
    marginTop: 15,
    borderRadius: 6,
    backgroundColor: '#292d62',
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: '#8588b3', fontSize: 8, marginBottom: 1 },
  summaryValue: { color: '#f4f4fb', fontSize: 11, fontWeight: '700' },
  summaryDivider: { width: 1, height: 25, backgroundColor: '#383e7b' },
  searchBox: {
    height: 33,
    marginHorizontal: 13,
    marginTop: 14,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#292d62',
    borderRadius: 6,
  },
  searchIcon: { color: '#a2a5cf', fontSize: 21, marginRight: 5 },
  searchInput: { flex: 1, color: '#f4f4fb', fontSize: 11, padding: 0 },
  cardsHeader: {
    marginHorizontal: 14,
    marginTop: 18,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { color: '#f4f4fb', fontSize: 11, fontWeight: '800' },
  addCard: { color: '#a2a5cf', fontSize: 9, fontWeight: '600' },
  cardGrid: {
    paddingHorizontal: 13,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
  cardItem: { width: '50%', alignItems: 'center' },
  cardImage: {
    width: 150,
    height: 200,
    borderRadius: 2,
    backgroundColor: '#292d62',
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
  cardName: {
    width: '100%',
    marginTop: 4,
    color: '#f4f4fb',
    fontSize: 8,
    textAlign: 'center',
  },
});
