import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getCard } from '../api/client';

export default function Carta() {
  const { t } = useTranslation();
  const { externalId, gameId } = useLocalSearchParams();
  const [card, setCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadCard() {
      if (!externalId) {
        setError(t('carta_nao_selecionada'));
        setIsLoading(false);
        return;
      }

      try {
        const cardData = await getCard(externalId, gameId);
        if (isMounted) {
          setCard(cardData);
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

    loadCard();

    return () => {
      isMounted = false;
    };
  }, [externalId, gameId, t]);

  function goBack() {
    router.back();
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={goBack} accessibilityLabel="Voltar">
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>
            {isLoading ? t('carregando') : card?.name ?? t('carta')}
          </Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {!error && card ? (
          <>
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

            <View style={styles.tagRow}>
              {card.rarity ? <Tag label={card.rarity} highlighted /> : null}
              {card.setName || card.setCode ? <Tag label={card.setName ?? card.setCode} /> : null}
              {card.cardType ? <Tag label={card.cardType} /> : null}
            </View>

            <Text style={styles.sectionLabel}>{t('caracteristicas')}</Text>
            <View style={styles.descriptionBox}>
              <Text style={styles.description}>
                {card.cardText || t('descricao_indisponivel')}
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statText}>
                  {t('carta')}{`\n`}{card.collectorNumber ?? '-'}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statText}>
                  {t('idioma')}{`\n`}{card.lang ?? '-'}
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Tag({ label, highlighted }) {
  return (
    <View style={[styles.tag, highlighted && styles.highlightedTag]}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#101126' },
  screen: { flex: 1, backgroundColor: '#101126' },
  content: { paddingBottom: 20 },
  header: {
    height: 53,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#292d62',
  },
  backButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#292d62',
    marginRight: 10,
  },
  backIcon: { color: '#f4f4fb', fontSize: 25, lineHeight: 23, marginTop: -2 },
  title: { color: '#f4f4fb', fontSize: 20, fontWeight: '800' },
  cardImage: {
    width: 120,
    height: 168,
    alignSelf: 'center',
    marginTop: 16,
  },
  imagePlaceholder: {
    width: 120,
    height: 168,
    alignSelf: 'center',
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#292d62',
  },
  placeholderText: { color: '#8588b3', fontSize: 10 },
  tagRow: {
    flexDirection: 'row',
    gap: 7,
    marginHorizontal: 16,
    marginTop: 13,
  },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 3, backgroundColor: '#292d62' },
  highlightedTag: { backgroundColor: '#353a78' },
  tagText: { color: '#e4e5f1', fontSize: 9, fontWeight: '600' },
  sectionLabel: { color: '#8588b3', fontSize: 10, fontWeight: '800', margin: 13 },
  descriptionBox: {
    minHeight: 68,
    marginHorizontal: 16,
    padding: 10,
    borderRadius: 7,
    backgroundColor: '#292d62',
    borderWidth: 1,
    borderColor: '#383e7b',
  },
  description: { color: '#a2a5cf', fontSize: 11, lineHeight: 16 },
  statsRow: { flexDirection: 'row', gap: 25, marginHorizontal: 16, marginTop: 21 },
  statBox: {
    flex: 1,
    minHeight: 53,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#292d62',
  },
  statText: { color: '#f4f4fb', fontSize: 20, lineHeight: 24, fontWeight: '800', textAlign: 'center' },
  errorText: { color: '#ff8f9b', textAlign: 'center', margin: 20, fontSize: 12 },
});
