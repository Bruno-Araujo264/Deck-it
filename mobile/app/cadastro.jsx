import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
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
import { register } from '../api/client';

export default function Cadastro() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister() {
    setError('');

    if (!nickname.trim() || !email.trim() || !password) {
      setError('Preencha nome, e-mail e senha.');
      return;
    }

    if (!acceptedTerms) {
      setError('Aceite os termos de uso para continuar.');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        nickname: nickname.trim(),
        email: email.trim().toLowerCase(),
        password,
        acceptedTerms,
      });
      router.replace('/(agrupamento)/home');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

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
              value={nickname}
              onChangeText={setNickname}
              placeholder="Bruno Mars"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Field
              label={t('email')}
              value={email}
              onChangeText={setEmail}
              placeholder="bruno@deckit.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              containerStyle={styles.spaced}
            />

            <Field
              label={t('senha')}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••••••"
              secure
              autoCapitalize="none"
              containerStyle={styles.spaced}
            />

            <Pressable
              style={styles.termsRow}
              onPress={() => setAcceptedTerms((accepted) => !accepted)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: acceptedTerms }}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <Text style={styles.termsText}>Aceito os termos de uso.</Text>
            </Pressable>

            <Button label={t('entrar')} onPress={handleRegister} />

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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#8588b3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#625ff0',
    borderColor: '#625ff0',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 16,
  },
  termsText: {
    color: '#ddddE5',
    fontSize: 10,
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
