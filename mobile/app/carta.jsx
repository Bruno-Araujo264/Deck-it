import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
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

  return (
    <Screen>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <AppHeader
          variant="page"
          title="Charizard Vmax"
          onBack={() => router.replace('/decks')}
          style={styles.header}
        />

        <View style={styles.cardStage}>
          <View style={styles.cardFrame}>
            <Image
              source={require('../assets/charizard.jpg')}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </View>
        </View>

        <View style={styles.tagRow}>
          <Tag label="Mythic Rare" color={colors.gold} highlight />
          <Tag label="Magic" color={colors.mtg} />
          <Tag label="Mythic Rare" color={colors.gold} highlight />
          <Tag label="Magic" color={colors.mtg} />
        </View>

        <View style={styles.section}>
          <SectionLabel>{t('caracteristicas')}</SectionLabel>
          <GlassCard style={styles.descriptionBox}>
            <Text style={styles.description}>
              LOREM LOREM LOREM LOREM LOREM LOREM LOREM LOREM LOREM LOREM LOREM LOREM
            </Text>
          </GlassCard>
        </View>

        <View style={styles.statsRow}>
          <StatBox label={t('carta')} value="Nº 643" />
          <StatBox label={t('valor_estimado')} value="~R$ 56,46" color={colors.success} />
        </View>

        <View style={styles.actions}>
          <Button label={t('apagar_carta')} variant="danger" size="sm" style={styles.action} />
          <Button label={t('editar_carta')} variant="secondary" size="sm" style={styles.action} />
        </View>
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

  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.gutter,
    marginTop: spacing.xl,
  },
  action: { flex: 1 },
});
