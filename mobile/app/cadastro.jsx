import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, Field, Logo, Screen } from '../components';
import { colors, fonts, spacing, type } from '../theme';

export default function Cadastro() {
  const { t } = useTranslation();

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Logo size={72} withWordmark stacked wordmarkSize={24} style={styles.brand} />
          <Text style={styles.title}>Cadastrar</Text>

          <View style={styles.form}>
            <Field
              label={t('nome')}
              placeholder="Bruno Mars"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Field
              label={t('email')}
              placeholder="hello@design.co"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              containerStyle={styles.spaced}
            />

            <Field
              label={t('senha')}
              placeholder="••••••••••••"
              secure
              autoCapitalize="none"
              containerStyle={styles.spaced}
            />

            <Pressable style={styles.forgotButton}>
              <Text style={styles.forgotText}>{t('esqueci_senha')}?</Text>
            </Pressable>

            <Button label={t('entrar')} />

            <View style={styles.createAccountRow}>
              <Text style={styles.helperText}>{t('com_conta')}</Text>
              <Pressable onPress={() => router.push('/login')} hitSlop={6}>
                <Text style={styles.actionText}> {t('entrar')}!</Text>
              </Pressable>
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>{t('continuar_com')}</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialRow}>
              <Button label="Google" icon="⊗" variant="secondary" size="sm" style={styles.social} />
              <Button label="Apple" icon="♡" variant="secondary" size="sm" style={styles.social} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  brand: { marginBottom: spacing.sm },
  title: {
    ...type.headlineMd,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  form: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  spaced: { marginTop: spacing.md },
  forgotButton: { alignSelf: 'flex-end', paddingVertical: spacing.sm },
  forgotText: { ...type.bodySm, color: colors.gold },
  createAccountRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  helperText: { ...type.bodySm, color: colors.textSecondary },
  actionText: { ...type.bodySm, fontFamily: fonts.bodyBold, color: colors.gold },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { ...type.labelSm, color: colors.textMuted },
  socialRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  social: { flex: 1 },
});
