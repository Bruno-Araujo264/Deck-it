import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Logo, Screen } from '../components';
import { colors, spacing, type } from '../theme';

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.brandArea}>
          <Logo size={128} withWordmark stacked wordmarkSize={38} tagline="Mesa Encantada TCG" />
        </View>

        <Button
          label={t('bem_vindo')}
          onPress={() => router.push('/login')}
          style={styles.enterButton}
          textStyle={styles.enterText}
        />

        <Text style={styles.copyright}>© - Direitos Autorais Absolum Idum Opus</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  brandArea: { alignItems: 'center' },
  enterButton: {
    minWidth: 200,
    height: 56,
    marginTop: spacing.xxl * 2,
  },
  enterText: { ...type.titleLg, color: colors.textOnLight },
  copyright: {
    ...type.labelSm,
    color: colors.textMuted,
    position: 'absolute',
    bottom: spacing.md,
  },
});
