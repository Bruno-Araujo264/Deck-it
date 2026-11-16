import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { createDeck, deleteDeck, getDeckItems, getGames, updateDeck } from '../api/client';

export default function CriarDeckScreen() {
  const { t } = useTranslation();
  const { deckId: rawDeckId } = useLocalSearchParams();
  const deckId = Array.isArray(rawDeckId) ? rawDeckId[0] : rawDeckId;
  const isEditing = /^\d+$/.test(String(deckId ?? ''));
  const [games, setGames] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isGamePickerOpen, setIsGamePickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingDeck, setIsLoadingDeck] = useState(isEditing);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [availableGames, deck] = await Promise.all([
          getGames(),
          isEditing ? getDeckItems(deckId) : Promise.resolve(null),
        ]);
        if (isMounted) {
          setGames(availableGames);
          if (deck) {
            setName(deck.name);
            setSelectedGame(deck.game);
            if (deck.imageData) {
              setCoverImage({ uri: deck.imageData, data: null });
            }
          }
        }
      } catch {
        if (isMounted) {
          setError(isEditing ? t('erro_carregar_deck') : t('erro_carregar_jogos'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsLoadingDeck(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [deckId, isEditing, t]);

  async function pickCoverImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(t('permissao_galeria_negada'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]?.base64) {
      const asset = result.assets[0];
      const mimeType = asset.mimeType ?? 'image/jpeg';
      setCoverImage({
        uri: asset.uri,
        data: `data:${mimeType};base64,${asset.base64}`,
      });
    }
  }
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
      if (isEditing) {
        await updateDeck(deckId, {
          gameId: selectedGame.id,
          name: name.trim(),
          imageData: coverImage?.data,
        });
      } else {
        await createDeck(selectedGame.id, name.trim(), coverImage?.data);
      }
      router.replace('/(agrupamento)/home');
    } catch (requestError) {
      setError(requestError.message || t('erro_criar_deck'));
    } finally {
      setIsSaving(false);
    }
  }

  function handleDeleteDeck() {
    Alert.alert(
      t('excluir_deck'),
      t('confirmar_excluir_deck'),
      [
        { text: t('cancelar'), style: 'cancel' },
        {
          text: t('excluir'),
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            setError('');
            try {
              await deleteDeck(deckId);
              router.replace('/(agrupamento)/home');
            } catch (requestError) {
              setError(requestError.message || t('erro_excluir_deck'));
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>{isEditing ? t('editar_deck') : t('criar_deck')}</Text>
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
            disabled={isLoading || isLoadingDeck}
          >
            <Text style={[styles.selectText, !selectedGame && styles.placeholder]}>
              {isLoading || isLoadingDeck ? t('carregando') : selectedGame?.name ?? t('selecione_um_jogo')}
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

          <FieldLabel text={t('imagem_do_deck')} />
          <Pressable style={styles.coverPicker} onPress={pickCoverImage}>
            {coverImage ? (
              <Image source={{ uri: coverImage.uri }} style={styles.coverPreview} resizeMode="cover" />
            ) : (
              <Text style={styles.coverPickerText}>{t('selecionar_imagem_galeria')}</Text>
            )}
          </Pressable>

          <Text style={styles.sectionTitle}>{t('cartas_no_deck')}</Text>
          <Pressable onPress={() => router.push('/selecionar-carta')}>
            <Text style={styles.emptyCards}>{t('adicionar_cartas')}</Text>
          </Pressable>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={[styles.createButton, isSaving && styles.disabledButton]}
            onPress={handleCreateDeck}
            disabled={isSaving || isDeleting}
          >
            <Text style={styles.createButtonText}>
            {isSaving ? t('carregando') : isEditing ? t('salvar_alteracoes') : t('criar_deck')}
            </Text>
          </Pressable>

          {isEditing ? (
            <Pressable
              style={[styles.deleteButton, isDeleting && styles.disabledButton]}
              onPress={handleDeleteDeck}
              disabled={isSaving || isDeleting}
            >
              <Text style={styles.deleteButtonText}>
                {isDeleting ? t('carregando') : t('excluir_deck')}
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </View>
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
  coverPicker: {
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#292d62',
    borderWidth: 1,
    borderColor: '#686bff',
    borderStyle: 'dashed',
  },
  coverPreview: { width: '100%', height: '100%' },
  coverPickerText: { color: '#ddddE5', fontSize: 11 },
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
  deleteButton: {
    height: 42,
    borderRadius: 22,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ff6878',
  },
  deleteButtonText: { color: '#ff8f9c', fontSize: 12, fontWeight: '800' },
  disabledButton: { opacity: 0.6 },
});
