import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function Cadastro() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.logo} accessibilityLabel="Deck-it">
            <View style={[styles.logoWing, styles.logoWingLeft]} />
            <View style={[styles.logoWing, styles.logoWingRight]} />
            <View style={styles.logoCenter} />
          </View>

          <Text style={styles.title}>Cadastrar</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Bruno Mars"
              placeholderTextColor="#8284a7"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="hello@design.co"
              placeholderTextColor="#8284a7"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={[styles.label, styles.passwordLabel]}>SENHA</Text>
            <View style={styles.passwordInputWrap}>
              <TextInput
                style={styles.passwordInput}
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

            <Pressable style={styles.forgotButton}>
              <Text style={styles.forgotText}>Esqueceu a senha?</Text>
            </Pressable>

            <Pressable style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Entrar</Text>
            </Pressable>

            <View style={styles.createAccountRow}>
              <Text style={styles.helperText}>Não possui uma conta?</Text>
              <Pressable>
                <Text style={styles.actionText}> Crie uma!</Text>
              </Pressable>
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Ou Continue Com</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialRow}>
              <Pressable style={styles.socialButton}>
                <Text style={styles.socialIcon}>⊗</Text>
                <Text style={styles.socialText}>Google</Text>
              </Pressable>
              <Pressable style={styles.socialButton}>
                <Text style={styles.socialIcon}>♡</Text>
                <Text style={styles.socialText}>Apple</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#101126',
  },
  container: {
    flex: 1,
    backgroundColor: '#101126',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 22,
    paddingTop: 22,
  },
  logo: {
    width: 112,
    height: 70,
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  logoWing: {
    position: 'absolute',
    top: 5,
    width: 43,
    height: 57,
    backgroundColor: '#d4d4d4',
    borderWidth: 4,
    borderColor: '#050509',
  },
  logoWingLeft: {
    left: 4,
    borderRadius: 19,
    transform: [{ rotate: '-25deg' }],
  },
  logoWingRight: {
    right: 4,
    borderRadius: 19,
    transform: [{ rotate: '25deg' }],
  },
  logoCenter: {
    position: 'absolute',
    left: 30,
    top: 0,
    width: 52,
    height: 67,
    borderRadius: 20,
    backgroundColor: '#d4d4d4',
    borderWidth: 4,
    borderColor: '#050509',
  },
  title: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 36,
  },
  form: {
    width: '100%',
  },
  label: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 6,
  },
  passwordLabel: {
    marginTop: 16,
  },
  input: {
    height: 37,
    borderRadius: 22,
    backgroundColor: '#292d62',
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 11,
  },
  passwordInputWrap: {
    height: 37,
    borderRadius: 22,
    backgroundColor: '#292d62',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 12,
  },
  eyeButton: {
    width: 42,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eye: {
    color: '#8588b3',
    fontSize: 18,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    paddingVertical: 14,
  },
  forgotText: {
    color: '#686bff',
    fontSize: 10,
  },
  loginButton: {
    height: 41,
    borderRadius: 24,
    backgroundColor: '#625ff0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  createAccountRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 17,
  },
  helperText: {
    color: '#ddddE5',
    fontSize: 10,
  },
  actionText: {
    color: '#686bff',
    fontSize: 10,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 28,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e1e1e4',
  },
  dividerText: {
    color: '#ffffff',
    fontSize: 9,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 17,
  },
  socialButton: {
    flex: 1,
    height: 37,
    borderRadius: 20,
    backgroundColor: '#292d62',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  socialIcon: {
    color: '#ffffff',
    fontSize: 18,
  },
  socialText: {
    color: '#ffffff',
    fontSize: 11,
  },
});