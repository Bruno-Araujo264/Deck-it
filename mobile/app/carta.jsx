import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getCard } from '../api/client';
import {
  AppHeader,
  Button,
  GlassCard,
  Screen,
  SectionLabel,
  StatBox,
  Tag,
} from '../components';
import { colors, radii, shadows, spacing, type } from '../theme';

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
    <Screen>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        //verificar se titulo funciona com o nome da carta, se nao tiver nome, colocar "Carta"
        <AppHeader
          variant="page"
          title= {card?.name ?? t('carta')}
          onBack={() => router.replace('/decks')}
          style={styles.header}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {!error && card ? (
          <>
            {card.imageNormal ? (
              <View style={styles.cardStage}>
              <View style={styles.cardFrame}>
              <Image
                source={{ uri: card.imageNormal }}
                style={styles.cardImage}
                resizeMode="contain"
              />
              </View>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>{t('imagem_indisponivel')}</Text>
              </View>
            )}

            <View style={styles.tagRow}>
              {card.rarity ? <Tag label={card.rarity} color={colors.gold} highlight /> : null}
              {card.setName || card.setCode ? <Tag label={card.setName ?? card.setCode} color={colors.gold} highlight/> : null}
              {card.cardType ? <Tag label={card.cardType} color={colors.gold} highlight/> : null}
            </View>

            <View style={styles.section}>
              <SectionLabel>{t('caracteristicas')}</SectionLabel>
              <GlassCard style={styles.descriptionBox}>
                <Text style={styles.description}>
                {card.cardText || t('descricao_indisponivel')}
                </Text>
              </GlassCard>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statsRow}>
                <StatBox label={t('carta')} value={card.collectorNumber ?? '-'} />
                <StatBox label={t('valor_estimado')} value="~R$ 56,46" color={colors.success} />
              </View>
            </View>
            <View style={styles.actions}>
              <Button label={t('apagar_carta')} variant="danger" size="sm" style={styles.action} />
              <Button label={t('editar_carta')} variant="secondary" size="sm" style={styles.action} />
            </View>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: spacing.xl },
  header: { marginBottom: spacing.lg },

  cardStage: { alignItems: 'center', marginBottom: spacing.md },
  cardFrame: {
    width: 184,
    aspectRatio: 3 / 4,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.bgDeepest,
    borderWidth: 1,
    borderColor: `${colors.gold}55`,
    ...shadows.gold,
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
  cardImage: { width: '100%', height: '100%' },

  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
    marginHorizontal: spacing.gutter,
  },

  section: { marginHorizontal: spacing.gutter, marginTop: spacing.lg },
  descriptionBox: { minHeight: 76 },
  description: { ...type.bodyMd, color: colors.textSecondary },

  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.gutter,
    marginTop: spacing.lg,
  },
  statText: { color: '#f4f4fb', fontSize: 20, lineHeight: 24, fontWeight: '800', textAlign: 'center' },
  errorText: { color: '#ff8f9b', textAlign: 'center', margin: 20, fontSize: 12 },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.gutter,
    marginTop: spacing.xl,
  },
  action: { flex: 1 },
});
