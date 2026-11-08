<<<<<<< HEAD
import { router, useLocalSearchParams } from 'expo-router';
=======
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
>>>>>>> origin/dev
import { useTranslation } from 'react-i18next';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
<<<<<<< HEAD
  AppHeader,
  IconButton,
  Screen,
  SearchField,
  SectionLabel,
  StatBox,
} from '../../components';
import { colors, radii, shadows, spacing, type } from '../../theme';

const cardNames = [
  'Lightning Bolt',
  'Mountain',
  'Goblin Guide',
  'Monastery Swiftspear',
  'Rift Bolt',
  'Lava Spike',
  'Eidolon of the Great Revel',
  'Searing Blaze',
];
=======
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getDeckItems } from '../../api/client';
>>>>>>> origin/dev

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
<<<<<<< HEAD
        <AppHeader
          variant="page"
          title="Pokemon Supremo"
          onBack={goBack}
          right={<IconButton icon="↗" accessibilityLabel="Editar deck" iconStyle={styles.editIcon} />}
          style={styles.header}
        />

        <View style={styles.summary}>
          <StatBox label={t('cartas')} value="60" />
          <StatBox label={t('jogo')} value="Magic" color={colors.mtg} />
        </View>

        <SearchField
          placeholder={t('buscar_cartas')}
          style={styles.search}
        />

        <SectionLabel
          style={styles.cardsLabel}
          right={
            <Pressable onPress={() => router.push('/adicionar')} hitSlop={6}>
              <Text style={styles.addCard}>＋ {t('adicionar_cartas')}</Text>
            </Pressable>
          }
        >
          {t('cartas_no_deck')}
        </SectionLabel>
=======
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
>>>>>>> origin/dev

        <View style={styles.cardGrid}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {!isLoading && !error && cards.length === 0 ? (
            <Text style={styles.emptyText}>{t('nenhuma_carta_no_deck')}</Text>
          ) : null}
          {cards.map((item) => (
            <Pressable
<<<<<<< HEAD
              key={name}
              style={({ pressed }) => [styles.cardItem, pressed && styles.cardPressed]}
              onPress={() => router.push('/carta')}
            >
              <View style={styles.cardFrame}>
                <Image
                  source={require('../../assets/charizard.jpg')}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.cardName} numberOfLines={1}>{name}</Text>
=======
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
>>>>>>> origin/dev
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
<<<<<<< HEAD
  cardImage: { width: '100%', height: '100%' },
=======
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
>>>>>>> origin/dev
  cardName: {
    width: '100%',
    marginTop: spacing.xs,
    ...type.labelSm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
