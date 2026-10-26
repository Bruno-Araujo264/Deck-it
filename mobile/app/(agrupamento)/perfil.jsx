import { useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import i18n, { supportedLanguages } from '../../i18n';

const profileRows = [
  { id: 'name', icon: '♙', labelKey: 'nome_completo', value: 'Bruno Mars' },
  { id: 'email', icon: '✉', labelKey: 'email', value: 'bruno.mars@deckit.com' },
  { id: 'password', icon: '▣', labelKey: 'alterar_senha', valueKey: 'senha_atualizada' },
];

export default function Perfil() {
  const { t } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [name, setName] = useState('Bruno Mars');
  const [email, setEmail] = useState('bruno.mars@deckit.com');
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);

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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('minha_conta')}</Text>
        </View>

        <View style={styles.profileSummary}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>BM</Text>
            <View style={styles.cameraBadge}>
              <Text style={styles.cameraIcon}>●</Text>
            </View>
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

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
                }
              }}
              accessibilityRole="button"
            >
              <View style={styles.rowIcon}><Text style={styles.iconText}>{row.icon}</Text></View>
              <Text style={styles.rowLabel}>{t(row.labelKey)}</Text>
              {row.id === 'name' && editingField === 'name' ? (
                <TextInput
                  ref={nameInputRef}
                  value={name}
                  onChangeText={setName}
                  onBlur={() => setEditingField(null)}
                  style={styles.rowInput}
                  returnKeyType="done"
                  autoFocus
                />
              ) : row.id === 'email' && editingField === 'email' ? (
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
              ) : (
                <Text style={styles.rowValue}>
                  {row.id === 'name' ? name : row.id === 'email' ? email : t(row.valueKey)}
                </Text>
              )}
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>{t('preferencias')}</Text>
        <View style={styles.group}>
          <View style={[styles.row, styles.rowBorder]}>
            <View style={styles.rowIcon}><Text style={styles.iconText}>♧</Text></View>
            <Text style={styles.rowLabel}>{t('notificacoes_push')}</Text>
            <Switch style={styles.rowSwitch}
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#383e7b', true: '#635bfa' }}
              thumbColor="#ffffff"
              accessibilityLabel={t('notificacoes_push')}
            />
          </View>
          <Pressable style={styles.row} onPress={showLanguagePicker}>
            <View style={styles.rowIcon}><Text style={styles.iconText}>◎</Text></View>
            <Text style={styles.rowLabel}>{t('idioma')}</Text>
            <Text style={styles.rowValue}>{getLanguageLabel(i18n.language)}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>{t('conta')}</Text>
        <View style={styles.group}>
          <Pressable style={[styles.row, styles.rowBorder]} onPress={() => router.push('/login')}>
            <View style={[styles.rowIcon, styles.dangerIcon]}>
              <Text style={styles.dangerText}>↪</Text>
            </View>
                <Text style={styles.sair}>{t('sair_da_conta')}</Text>
          </Pressable>
          <Pressable style={styles.row} onPress={() => showAccountAlert('Excluir Conta', 'A exclusão da conta estará disponível em breve.')}>
            <View style={styles.rowIcon}><Text style={styles.dangerText}>☒</Text></View>
            <Text style={styles.dangerLabel}>{t('excluir_conta')}</Text>
          </Pressable>
        </View>

        <Text style={styles.version}>DECK-IT v2.4.1 • ABSOLIUM UMP OPUS</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#101126' },
  screen: { flex: 1, backgroundColor: '#101126' },
  content: { paddingBottom: 92 },
  header: {
    height: 53,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#292d62',
  },
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
});
