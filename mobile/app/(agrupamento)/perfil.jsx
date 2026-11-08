<<<<<<< HEAD
import { useRef, useState } from 'react';
=======
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
>>>>>>> origin/dev
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { AppHeader, ListGroup, ListRow, Screen, SectionLabel } from '../../components';
import i18n, { supportedLanguages } from '../../i18n';
<<<<<<< HEAD
import { colors, radii, shadows, spacing, type } from '../../theme';
=======
import { getProfile } from '../../api/client';
>>>>>>> origin/dev

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

<<<<<<< HEAD
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
=======
        {profileError ? <Text style={styles.errorText}>{profileError}</Text> : null}

        <Text style={styles.sectionLabel}>{t('dados_pessoais')}</Text>
        <View style={styles.group}>
          {profileRows.map((row, index) => (
            <Pressable
              key={row.id}
              style={[styles.row, index < profileRows.length - 1 && styles.rowBorder]}
              onPress={() => {
                if (row.id === 'name') {
                  setEditingField('name');
                  nameInputRef.current?.focus();
                } else if (row.id === 'email') {
                  setEditingField('email');
                  emailInputRef.current?.focus();
                } else {
                  showAccountAlert(t(row.labelKey), t('opcao_indisponivel'));
>>>>>>> origin/dev
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
  rowSwitch: { transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] },
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
<<<<<<< HEAD
=======
  title: { color: '#f4f4fb', fontSize: 16, fontWeight: '800' },
  editButton: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 5, backgroundColor: '#292d62' },
  editText: { color: '#e3e4f1', fontSize: 10, fontWeight: '700' },
  profileSummary: { alignItems: 'center', paddingTop: 19, paddingBottom: 20 },
  avatar: { width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center', backgroundColor: '#635bfa', borderWidth: 3, borderColor: '#817bff' },
  avatarText: { color: '#ffffff', fontSize: 25, fontWeight: '800', letterSpacing: 1 },
  cameraBadge: { position: 'absolute', right: -2, bottom: -2, width: 23, height: 23, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#635bfa', borderWidth: 2, borderColor: '#101126' },
  cameraIcon: { color: '#ffffff', fontSize: 11 },
  name: { color: '#f4f4fb', fontSize: 19, fontWeight: '800', marginTop: 10 },
  email: { color: '#8588b3', fontSize: 11, marginTop: 3 },
  loadingText: { color: '#8588b3', fontSize: 11, marginTop: 10 },
  errorText: { color: '#ff8f9c', fontSize: 11, textAlign: 'center', marginHorizontal: 18, marginBottom: 8 },
  sair: { color: '#ff4f5e', fontSize: 12, fontWeight: '600' },
  nameInput: { minWidth: 150, paddingVertical: 3, color: '#f4f4fb', fontSize: 18, fontWeight: '800', textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#635bfa', marginTop: 8 },
  emailInput: { minWidth: 190, paddingVertical: 3, color: '#a2a5cf', fontSize: 11, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#635bfa', marginTop: 2 },
  sectionLabel: { color: '#8588b3', fontSize: 9, fontWeight: '800', marginHorizontal: 13, marginBottom: 5, marginTop: 0 },
  group: { marginHorizontal: 11, marginBottom: 22, overflow: 'hidden', borderRadius: 10, backgroundColor: '#292d62', borderWidth: 1, borderColor: '#383e7b' },
  row: { minHeight: 47, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#383e7b' },
  rowIcon: { width: 24, height: 24, marginRight: 9, alignItems: 'center', justifyContent: 'center', borderRadius: 5, backgroundColor: 'transparent' },
  iconText: { color: '#756eff', fontSize: 16 },
  rowLabel: { color: '#f4f4fb', fontSize: 12, flex: 1 },
  rowSwitch: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], alignSelf: 'center' },
  rowValue: { color: '#8588b3', fontSize: 10, marginRight: 9 },
  rowInput: { color: '#ffffff', fontSize: 10, marginRight: 9 },
  chevron: { color: '#a2a5cf', fontSize: 23, lineHeight: 23 },
  dangerIcon: { backgroundColor: '#343262' },
  dangerText: { color: '#ff4f5e', fontSize: 17 },
  dangerLabel: { color: '#ff4f5e', fontSize: 12, fontWeight: '600' },
  version: { color: '#8588b3', fontSize: 8, textAlign: 'center', marginTop: 0 },
>>>>>>> origin/dev
});
