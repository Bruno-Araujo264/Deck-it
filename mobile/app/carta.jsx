import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getCard, getCardMarket } from '../api/client';
import {
  AddToDeckSheet,
  AppHeader,
  Button,
  GlassCard,
  Screen,
  SectionLabel,
  StatBox,
  Tag,
} from '../components';
import { colors, radii, shadows, spacing, type } from '../theme';

const PRICE_LABELS = {
  usd: 'Normal',
  usd_foil: 'Foil',
  usd_etched: 'Etched',
  usd_holo: 'Holo',
  usd_reverse: 'Reverse holo',
  eur: 'Normal',
  eur_foil: 'Foil',
  eur_holo: 'Holo',
  tix: 'MTGO',
};

const brl = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

function formatOriginal({ currency, value }) {
  if (currency === 'USD') return `US$ ${value.toFixed(2)}`;
  if (currency === 'EUR') return `€ ${value.toFixed(2)}`;
  return `${value.toFixed(2)} tix`;
}

function parseAttributes(raw) {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) ?? {};
    } catch {
      return {};
    }
  }
  return raw;
}

/** Linhas "rótulo: valor" específicas de cada jogo, a partir de `attributes`. */
function gameFacts(attrs, t) {
  const facts = [];
  const push = (label, value) => {
    if (value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)) {
      facts.push({ label, value: Array.isArray(value) ? value.join(', ') : String(value) });
    }
  };
  // Pokémon
  push('HP', attrs.hp);
  push(t('tipo'), attrs.types);
  push(t('estagio'), attrs.stage);
  push(t('evolui_de'), attrs.evolve_from);
  push(t('fraqueza'), attrs.weaknesses?.map((w) => `${w.type} ${w.value ?? ''}`.trim()));
  push(t('recuo'), attrs.retreat);
  push(t('marca_regulamento'), attrs.regulation_mark);
  // Magic
  push(t('custo_mana'), attrs.mana_cost);
  push(t('cores'), attrs.colors);
  push(t('palavras_chave'), attrs.keywords);
  // Ambos
  push(t('ilustrador'), attrs.illustrator);
  return facts;
}

export default function Carta() {
  const { t } = useTranslation();
  const { externalId, gameId, source } = useLocalSearchParams();
  const [card, setCard] = useState(null);
  const [market, setMarket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarketLoading, setIsMarketLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCard() {
      if (!externalId) {
        setError(t('carta_nao_selecionada'));
        setIsLoading(false);
        setIsMarketLoading(false);
        return;
      }

      try {
        const cardData = await getCard(externalId, gameId);
        if (isMounted) setCard(cardData);
      } catch (requestError) {
        if (isMounted) setError(requestError.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }

      // Preço é secundário: se falhar, a tela continua funcionando.
      try {
        const marketData = await getCardMarket(externalId, gameId);
        if (isMounted) setMarket(marketData);
      } catch {
        if (isMounted) setMarket(null);
      } finally {
        if (isMounted) setIsMarketLoading(false);
      }
    }

    loadCard();

    return () => {
      isMounted = false;
    };
  }, [externalId, gameId, t]);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/decks');
    }
  }

  function handleAdded(deck) {
    setIsSheetOpen(false);
    Alert.alert(t('carta_adicionada_deck'), deck.name, [
      { text: 'OK', style: 'cancel' },
      {
        text: t('ir_para_deck'),
        onPress: () => router.replace({ pathname: '/decks', params: { deckId: String(deck.id) } }),
      },
    ]);
  }

  const attrs = parseAttributes(card?.attributes);
  const facts = card ? gameFacts(attrs, t) : [];
  const attacks = Array.isArray(attrs.attacks) ? attrs.attacks : [];
  const abilities = Array.isArray(attrs.abilities) ? attrs.abilities : [];
  const estimated = market?.estimated;
  const estimatedLabel = isMarketLoading
    ? '…'
    : estimated
      ? estimated.valueBrl !== null
        ? `~${brl(estimated.valueBrl)}`
        : formatOriginal(estimated)
      : t('sem_preco');

  return (
    <Screen>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <AppHeader variant="page" title={card?.name ?? t('carta')} onBack={goBack} style={styles.header} />

        {isLoading ? <ActivityIndicator color={colors.gold} style={styles.loading} /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {!error && card ? (
          <>
            {card.imageNormal ? (
              <View style={styles.cardStage}>
                <View style={styles.cardFrame}>
                  <Image source={{ uri: card.imageNormal }} style={styles.cardImage} resizeMode="contain" />
                </View>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>{t('imagem_indisponivel')}</Text>
              </View>
            )}

            <View style={styles.tagRow}>
              {card.rarity ? <Tag label={card.rarity} color={colors.gold} highlight /> : null}
              {card.setName || card.setCode ? (
                <Tag label={card.setName ?? card.setCode} color={colors.gold} highlight />
              ) : null}
              {card.cardType ? <Tag label={card.cardType} color={colors.gold} highlight /> : null}
            </View>

            <View style={styles.statsRow}>
              <StatBox
                label={t('numero')}
                value={`${card.setCode ? `${card.setCode.toUpperCase()} ` : ''}#${card.collectorNumber ?? '-'}`}
              />
              <StatBox label={t('valor_estimado')} value={estimatedLabel} color={colors.success} />
            </View>

            <View style={styles.primaryAction}>
              <Button label={`＋ ${t('adicionar_a_deck')}`} onPress={() => setIsSheetOpen(true)} full />
            </View>

            {market?.prices?.length ? (
              <View style={styles.section}>
                <SectionLabel>{t('precos_mercado')}</SectionLabel>
                <GlassCard>
                  {market.prices.map((price) => (
                    <View key={price.priceType} style={styles.priceRow}>
                      <Text style={styles.priceLabel}>
                        {PRICE_LABELS[price.priceType] ?? price.priceType}
                        <Text style={styles.priceSource}>
                          {price.currency === 'USD' ? ' · TCGplayer' : price.currency === 'EUR' ? ' · Cardmarket' : ''}
                        </Text>
                      </Text>
                      <View style={styles.priceValues}>
                        <Text style={styles.priceValue}>{formatOriginal(price)}</Text>
                        {price.valueBrl !== null ? (
                          <Text style={styles.priceBrl}>{brl(price.valueBrl)}</Text>
                        ) : null}
                      </View>
                    </View>
                  ))}
                  <Text style={styles.priceNote}>
                    {t('nota_precos', { date: market.rates?.date ?? '-' })}
                  </Text>
                </GlassCard>
              </View>
            ) : null}

            {facts.length ? (
              <View style={styles.section}>
                <SectionLabel>{t('caracteristicas')}</SectionLabel>
                <GlassCard>
                  {facts.map((fact) => (
                    <View key={fact.label} style={styles.factRow}>
                      <Text style={styles.factLabel}>{fact.label}</Text>
                      <Text style={styles.factValue}>{fact.value}</Text>
                    </View>
                  ))}
                </GlassCard>
              </View>
            ) : null}

            {abilities.length || attacks.length ? (
              <View style={styles.section}>
                <SectionLabel>{t('ataques')}</SectionLabel>
                <GlassCard contentStyle={styles.moves}>
                  {abilities.map((ability) => (
                    <View key={`ability-${ability.name}`}>
                      <Text style={styles.moveName}>
                        {ability.type ?? 'Ability'}: {ability.name}
                      </Text>
                      {ability.effect ? <Text style={styles.moveText}>{ability.effect}</Text> : null}
                    </View>
                  ))}
                  {attacks.map((attack) => (
                    <View key={`attack-${attack.name}`}>
                      <View style={styles.moveHeader}>
                        <Text style={styles.moveName}>{attack.name}</Text>
                        {attack.damage ? <Text style={styles.moveDamage}>{attack.damage}</Text> : null}
                      </View>
                      {attack.cost?.length ? <Text style={styles.moveCost}>{attack.cost.join(' · ')}</Text> : null}
                      {attack.effect ? <Text style={styles.moveText}>{attack.effect}</Text> : null}
                    </View>
                  ))}
                </GlassCard>
              </View>
            ) : null}

            {card.cardText ? (
              <View style={styles.section}>
                <SectionLabel>{t('descricao')}</SectionLabel>
                <GlassCard style={styles.descriptionBox}>
                  <Text style={styles.description}>{card.cardText}</Text>
                </GlassCard>
              </View>
            ) : null}

            {source !== 'scanner' ? (
              <View style={styles.actions}>
                <Button label={t('apagar_carta')} variant="danger" size="sm" style={styles.action} />
                <Button label={t('editar_carta')} variant="secondary" size="sm" style={styles.action} />
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>

      <AddToDeckSheet
        visible={isSheetOpen}
        card={card}
        onClose={() => setIsSheetOpen(false)}
        onAdded={handleAdded}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: spacing.xl },
  header: { marginBottom: spacing.lg },
  loading: { marginTop: spacing.xl },

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

  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.gutter,
    marginTop: spacing.lg,
  },
  primaryAction: { marginHorizontal: spacing.gutter, marginTop: spacing.md },

  section: { marginHorizontal: spacing.gutter, marginTop: spacing.lg },
  descriptionBox: { minHeight: 76 },
  description: { ...type.bodyMd, color: colors.textSecondary },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xxs,
    gap: spacing.sm,
  },
  priceLabel: { ...type.labelLg, color: colors.textPrimary, flexShrink: 1 },
  priceSource: { ...type.labelSm, color: colors.textMuted },
  priceValues: { alignItems: 'flex-end' },
  priceValue: { ...type.labelLg, color: colors.success },
  priceBrl: { ...type.labelSm, color: colors.textSecondary },
  priceNote: { ...type.labelSm, color: colors.textMuted, marginTop: spacing.xs },

  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xxs,
    gap: spacing.sm,
  },
  factLabel: { ...type.labelLg, color: colors.textMuted },
  factValue: { ...type.labelLg, color: colors.textPrimary, flexShrink: 1, textAlign: 'right' },

  moves: { gap: spacing.sm },
  moveHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  moveName: { ...type.titleMd, color: colors.textPrimary },
  moveDamage: { ...type.titleMd, color: colors.gold },
  moveCost: { ...type.labelSm, color: colors.lavender },
  moveText: { ...type.bodySm, color: colors.textSecondary, marginTop: 2 },

  errorText: { color: '#ff8f9b', textAlign: 'center', margin: 20, fontSize: 12 },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.gutter,
    marginTop: spacing.xl,
  },
  action: { flex: 1 },
});
