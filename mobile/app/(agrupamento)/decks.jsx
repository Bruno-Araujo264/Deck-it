import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
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

export default function Decks() {
  const { t } = useTranslation();
  const { source } = useLocalSearchParams();

  function goBack() {
    const previousRoute = source === 'buscar' ? '/buscar' : source === 'adicionar' ? '/adicionar' : '/home';
    router.replace(previousRoute);
  }

  return (
    <Screen>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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

        <View style={styles.cardGrid}>
          {cardNames.map((name) => (
            <Pressable
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
  cardImage: { width: '100%', height: '100%' },
  cardName: {
    width: '100%',
    marginTop: spacing.xs,
    ...type.labelSm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
