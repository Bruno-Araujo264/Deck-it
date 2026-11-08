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
<<<<<<< HEAD
import { Button, Field, Logo, Screen } from '../components';
import { colors, fonts, spacing, type } from '../theme';

export default function Cadastro() {
  const { t } = useTranslation();
=======
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
>>>>>>> origin/dev

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
<<<<<<< HEAD
            <Field
              label={t('nome')}
              placeholder="Bruno Mars"
=======
            <Text style={styles.label}>{t('nome')}</Text>
            <TextInput
              style={styles.input}
              value={nickname}
              onChangeText={setNickname}
              placeholder="Bruno Mars"
              placeholderTextColor="#8284a7"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.label}>{t('email')}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="hello@design.co"
              placeholderTextColor="#8284a7"
              keyboardType="email-address"
>>>>>>> origin/dev
              autoCapitalize="none"
              autoCorrect={false}
            />

<<<<<<< HEAD
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
=======
            <Text style={[styles.label, styles.passwordLabel]}>{t('senha')}</Text>
            <View style={styles.passwordInputWrap}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••••••"
                placeholderTextColor="#8284a7"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword((visible) => !visible)}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <Text style={styles.eye}>{showPassword ? '◉' : '◌'}</Text>
              </Pressable>
            </View>
>>>>>>> origin/dev

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

<<<<<<< HEAD
            <Button label={t('entrar')} />
=======
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Cadastrando...' : t('cadastrar')}
              </Text>
            </Pressable>
>>>>>>> origin/dev

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
<<<<<<< HEAD
  form: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  spaced: { marginTop: spacing.md },
  forgotButton: { alignSelf: 'flex-end', paddingVertical: spacing.sm },
  forgotText: { ...type.bodySm, color: colors.gold },
=======
  disabledButton: {
    opacity: 0.6,
  },
  errorText: {
    color: '#ff8f9c',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
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
>>>>>>> origin/dev
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
