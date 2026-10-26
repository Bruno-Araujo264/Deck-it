import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import {
  AppHeader,
  GemChip,
  GlassCard,
  Screen,
  SectionLabel,
  Tag,
} from '../../components';
import { colors, gameColor, radii, spacing, type } from '../../theme';

const categories = [
  { label: 'Magic', icon: '✣' },
  { label: 'Pokémon', icon: '☆' },
  { label: 'Yu-Gi-Oh', icon: '◈' },
  { label: 'Lorcana', icon: '✤' },
];

const decks = [
  { game: 'Magic', name: 'Commander Red Burn', cards: 100, age: '2h ago' },
  { game: 'Pokémon', name: 'Charizard Ex Deck', cards: 60, age: '1d ago' },
  { game: 'Yu-Gi-Oh', name: 'Blue-Eyes Dragon', cards: 40, age: '3d ago' },
];

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        data={decks}
        keyExtractor={(deck) => deck.name}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <AppHeader tagline="Mesa Encantada TCG" style={styles.header} />

            <SectionLabel style={styles.realmLabel}>Filtrar por reino</SectionLabel>
            <FlatList
              horizontal
              data={categories}
              keyExtractor={(category) => category.label}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => <GemChip label={item.label} game={item.label} />}
            />

            <SectionLabel style={styles.recentLabel}>{t('decks_recentes')}</SectionLabel>
          </>
        }
        renderItem={({ item }) => {
          const gem = gameColor(item.game);
          return (
            <GlassCard glowColor={gem} onPress={() => {}} style={styles.deckCard}>
              <View style={[styles.deckImage, { borderColor: `${gem}66` }]}>
                <Text style={[styles.imageLabel, { color: gem }]}>IMAGE</Text>
              </View>

              <View style={styles.deckInfo}>
                <Tag label={item.game} color={gem} style={styles.gameTag} />
                <Text style={styles.deckName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardCount}>
                  {item.cards}
                  {' '}
                  {t(item.cards === 1 ? 'carta' : 'cartas').toLowerCase()}
                </Text>
              </View>

              <Text style={styles.age}>{item.age}</Text>
            </GlassCard>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { paddingBottom: spacing.lg },
  header: { marginBottom: spacing.lg },
  realmLabel: { marginHorizontal: spacing.gutter },
  categoryList: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  recentLabel: { marginHorizontal: spacing.gutter, marginTop: spacing.lg },
  deckCard: {
    marginHorizontal: spacing.gutter,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deckImage: {
    width: 52,
    height: 72,
    borderRadius: radii.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgDeepest,
  },
  imageLabel: { ...type.labelSm, fontSize: 8, opacity: 0.8 },
  deckInfo: { flex: 1, gap: 3 },
  gameTag: { alignSelf: 'flex-start' },
  deckName: { ...type.headlineSm, color: colors.textPrimary },
  cardCount: { ...type.bodySm, color: colors.textSecondary },
  age: { ...type.labelSm, color: colors.textMuted, alignSelf: 'flex-start' },
});
