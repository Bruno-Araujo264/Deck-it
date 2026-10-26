import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { createDeck, getGames } from '../api/client';

export default function CriarDeckScreen() {
  const { t } = useTranslation();
  const [games, setGames] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [isGamePickerOpen, setIsGamePickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadGames() {
      try {
        const availableGames = await getGames();
        if (isMounted) {
          setGames(availableGames);
        }
      } catch {
        if (isMounted) {
          setError(t('erro_carregar_jogos'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadGames();
    return () => {
      isMounted = false;
    };
  }, [t]);

  async function handleCreateDeck() {
    setError('');

    if (!name.trim()) {
      setError(t('preencha_nome_deck'));
      return;
    }

    if (!selectedGame) {
      setError(t('selecione_jogo'));
      return;
    }

    setIsSaving(true);
    try {
      await createDeck(selectedGame.id, name.trim());
      router.replace('/(agrupamento)/home');
    } catch (requestError) {
      setError(requestError.message || t('erro_criar_deck'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>{t('criar_deck')}</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.cancelText}>{t('cancelar')}</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <FieldLabel text={t('nome_do_deck')} />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={t('nome_deck_placeholder')}
            placeholderTextColor="#8588b3"
            autoCapitalize="sentences"
          />

          <FieldLabel text={t('tipo_de_jogo')} />
          <Pressable
            style={styles.select}
            onPress={() => setIsGamePickerOpen((open) => !open)}
            disabled={isLoading}
          >
            <Text style={[styles.selectText, !selectedGame && styles.placeholder]}>
              {isLoading ? t('carregando') : selectedGame?.name ?? t('selecione_um_jogo')}
            </Text>
            <Text style={styles.chevron}>{isGamePickerOpen ? '⌃' : '⌄'}</Text>
          </Pressable>

          {isGamePickerOpen ? (
            <View style={styles.gameOptions}>
              {games.length === 0 ? (
                <Text style={styles.optionText}>{t('nenhum_jogo_disponivel')}</Text>
              ) : (
                games.map((game) => (
                  <Pressable
                    key={game.id}
                    style={styles.option}
                    onPress={() => {
                      setSelectedGame(game);
                      setIsGamePickerOpen(false);
                    }}
                  >
                    <Text style={styles.optionText}>{game.name}</Text>
                  </Pressable>
                ))
              )}
            </View>
          ) : null}

          <FieldLabel text={t('descricao_opcional')} />
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            value={description}
            onChangeText={setDescription}
            placeholder={t('descricao_placeholder')}
            placeholderTextColor="#8588b3"
            multiline
          />

          <Text style={styles.sectionTitle}>{t('cartas_no_deck')}</Text>
          <Text style={styles.emptyCards}>{t('adicionar_cartas')}</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={[styles.createButton, isSaving && styles.disabledButton]}
            onPress={handleCreateDeck}
            disabled={isSaving}
          >
            <Text style={styles.createButtonText}>
              {isSaving ? t('carregando') : t('criar_deck')}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FieldLabel({ text }) {
  return <Text style={styles.fieldLabel}>{text.toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#101126' },
  screen: { flex: 1, backgroundColor: '#101126' },
  topBar: {
    height: 66,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#3767d9',
    borderStyle: 'dotted',
  },
  backButton: {
    width: 28,
    height: 28,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#292d62',
    marginRight: 10,
  },
  backIcon: { color: '#ffffff', fontSize: 24, lineHeight: 22 },
  title: { flex: 1, color: '#ffffff', fontSize: 15, fontWeight: '800' },
  cancelText: { color: '#8588b3', fontSize: 10 },
  content: { padding: 18, paddingBottom: 36 },
  fieldLabel: { color: '#ffffff', fontSize: 9, fontWeight: '700', marginTop: 16, marginBottom: 7 },
  input: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    color: '#ffffff',
    backgroundColor: '#292d62',
    fontSize: 11,
  },
  descriptionInput: { height: 62, paddingTop: 14, textAlignVertical: 'top' },
  select: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#292d62',
  },
  selectText: { flex: 1, color: '#ffffff', fontSize: 11 },
  placeholder: { color: '#8588b3' },
  chevron: { color: '#8588b3', fontSize: 17 },
  gameOptions: { marginTop: 5, borderRadius: 12, overflow: 'hidden', backgroundColor: '#292d62' },
  option: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#383e7b' },
  optionText: { color: '#ffffff', fontSize: 11 },
  sectionTitle: { color: '#ffffff', fontSize: 12, fontWeight: '800', marginTop: 22, marginBottom: 10 },
  emptyCards: {
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#686bff',
    color: '#ddddE5',
    textAlign: 'center',
    paddingTop: 12,
    fontSize: 11,
  },
  errorText: { color: '#ff8f9c', fontSize: 11, textAlign: 'center', marginTop: 16 },
  createButton: {
    height: 42,
    borderRadius: 22,
    marginTop: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#625ff0',
  },
  createButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  disabledButton: { opacity: 0.6 },
});
