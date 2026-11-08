import { useRef, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { AppHeader, ListGroup, ListRow, Screen, SectionLabel } from '../../components';
import i18n, { supportedLanguages } from '../../i18n';
import { getProfile } from '../../api/client';
import { colors, radii, shadows, spacing, type } from '../../theme';

const profileRows = [
  { id: 'name', icon: '♙', labelKey: 'nome_completo' },
  { id: 'email', icon: '✉', labelKey: 'email' },
  { id: 'password', icon: '▣', labelKey: 'alterar_senha', valueKey: 'senha_atualizada' },
];

export default function Perfil() {
  const { t } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const profile = await getProfile();
        if (!isMounted) {
          return;
        }

        setName(profile.nickname ?? '');
        setEmail(profile.email ?? '');
      } catch (error) {
        if (isMounted) {
          setProfileError(error.message);
        }
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  function showAccountAlert(title, message) {
    Alert.alert(title, message, [{ text: 'OK' }]);
  }

  function getLanguageLabel(language) {
    return t(language === 'pt' ? 'idioma_portugues' : 'idioma_ingles');
  }

  function showLanguagePicker() {
    Alert.alert(
      t('selecionar_idioma'),
      undefined,
      supportedLanguages.map((language) => ({
        text: getLanguageLabel(language),
        onPress: async () => {
          try {
            await i18n.changeLanguage(language);
            Alert.alert(t('idioma_selecionado', { language: getLanguageLabel(language) }));
          } catch (error) {
            console.error('Failed to change language:', error);
            Alert.alert(t('erro_alterar_idioma'));
          }
        },
      })),
      { cancelable: true },
    );
  }

  function renderProfileValue(row) {
    if (row.id === 'name' && editingField === 'name') {
      return (
        <TextInput
          ref={nameInputRef}
          value={name}
          onChangeText={setName}
          onBlur={() => setEditingField(null)}
          style={styles.rowInput}
          returnKeyType="done"
          autoFocus
        />
      );
    }

    if (row.id === 'email' && editingField === 'email') {
      return (
        <TextInput
          ref={emailInputRef}
          value={email}
          onChangeText={setEmail}
          onBlur={() => setEditingField(null)}
          style={styles.rowInput}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="done"
          autoFocus
        />
      );
    }

    return null;
  }

  function handleProfileRowPress(row) {
    if (row.id === 'name') {
      setEditingField('name');
      nameInputRef.current?.focus();
    } else if (row.id === 'email') {
      setEditingField('email');
      emailInputRef.current?.focus();
    } else {
      showAccountAlert(t(row.labelKey), t('opcao_indisponivel'));
    }
  }

  return (
    <Screen>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader variant="page" title={t('minha_conta')} style={styles.header} />

        <View style={styles.profileSummary}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
            <View style={styles.cameraBadge}>
              <Text style={styles.cameraIcon}>●</Text>
            </View>
          </View>
          {isLoadingProfile ? (
            <Text style={styles.loadingText}>Carregando perfil...</Text>
          ) : (
            <>
              <Text style={styles.name}>{name || 'Usuário'}</Text>
              <Text style={styles.email}>{email}</Text>
            </>
          )}
        </View>

        <View style={styles.section}>
          <SectionLabel>{t('dados_pessoais')}</SectionLabel>
          <ListGroup>
            {profileRows.map((row) => (
              <ListRow
                key={row.id}
                icon={row.icon}
                label={t(row.labelKey)}
                value={
                  row.id === 'name' ? name : row.id === 'email' ? email : t(row.valueKey)
                }
                right={renderProfileValue(row)}
                chevron
                onPress={() => handleProfileRowPress(row)}
              />
            ))}
          </ListGroup>
        </View>

        <View style={styles.section}>
          <SectionLabel>{t('preferencias')}</SectionLabel>
          <ListGroup>
            <ListRow
              icon="♧"
              label={t('notificacoes_push')}
              right={
                <Switch
                  style={styles.rowSwitch}
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: colors.surfaceHighest, true: colors.gold }}
                  thumbColor={colors.textPrimary}
                  accessibilityLabel={t('notificacoes_push')}
                />
              }
            />
            <ListRow
              icon="◎"
              label={t('idioma')}
              value={getLanguageLabel(i18n.language)}
              chevron
              onPress={showLanguagePicker}
            />
          </ListGroup>
        </View>

        <View style={styles.section}>
          <SectionLabel>{t('conta')}</SectionLabel>
          <ListGroup>
            <ListRow
              icon="↪"
              label={t('sair_da_conta')}
              danger
              onPress={() => router.push('/login')}
            />
            <ListRow
              icon="☒"
              label={t('excluir_conta')}
              danger
              onPress={() =>
                showAccountAlert('Excluir Conta', 'A exclusão da conta estará disponível em breve.')
              }
            />
          </ListGroup>
        </View>

        <Text style={styles.version}>DECK-IT v2.4.1 • ABSOLIUM UMP OPUS</Text>
      </ScrollView>
    </Screen>
  );
}

function getInitials(name) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return initials || 'U';
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.md },

  profileSummary: { alignItems: 'center', paddingVertical: spacing.md },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.gold,
    ...shadows.gold,
  },
  avatarText: {
    ...type.brandMd,
    fontSize: 26,
    lineHeight: 32,
    color: colors.gold,
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
    borderWidth: 2,
    borderColor: colors.bgDeep,
  },
  cameraIcon: { color: colors.textOnLight, fontSize: 11 },
  name: { ...type.headlineMd, color: colors.textPrimary, marginTop: spacing.sm },
  email: { ...type.bodySm, color: colors.textSecondary, marginTop: 2 },

  section: { marginHorizontal: spacing.gutter, marginBottom: spacing.lg },
  rowSwitch: { transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }], alignSelf: 'center' },
  rowInput: {
    ...type.bodySm,
    color: colors.textPrimary,
    minWidth: 120,
    textAlign: 'right',
  },

  version: {
    ...type.labelSm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
