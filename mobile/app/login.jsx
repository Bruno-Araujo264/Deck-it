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

export default function LoginScreen() {
  const { t } = useTranslation();
=======
import { login } from '../api/client';

export default function LoginScreen() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    setError('');
    setIsLoading(true);

    try {
      await login(email.trim(), password);
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
          <Logo size={88} withWordmark stacked wordmarkSize={28} style={styles.brand} />

          <View style={styles.form}>
<<<<<<< HEAD
            <Field
              label="Email"
=======
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
>>>>>>> origin/dev
              placeholder="hello@design.co"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

<<<<<<< HEAD
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

            <Pressable style={styles.forgotButton}>
              <Text style={styles.forgotText}>{t('esqueci_senha')}?</Text>
            </Pressable>

<<<<<<< HEAD
            <Button label={t('entrar')} onPress={() => router.push('/home')} />
=======
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Entrando...' : t('entrar')}
              </Text>
            </Pressable>
>>>>>>> origin/dev

            <View style={styles.createAccountRow}>
              <Text style={styles.helperText}>{t('sem_conta')}</Text>
              <Pressable onPress={() => router.push('/cadastro')} hitSlop={6}>
                <Text style={styles.actionText}> {t('criar_conta')}!</Text>
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
<<<<<<< HEAD
  brand: { marginBottom: spacing.xl },
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
