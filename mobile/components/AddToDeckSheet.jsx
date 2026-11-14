import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { addCardToDeck, createDeck, getDecks } from '../api/client';
import { colors, radii, spacing, type } from '../theme';
import Button from './Button';
import Field from './Field';

/**
 * Folha inferior para adicionar uma carta a um deck do usuário
 * (só decks do mesmo jogo da carta) ou criar um deck novo já com ela.
 *
 * onAdded(deck) é chamado depois que a carta entra no deck.
 */
export default function AddToDeckSheet({ visible, card, onClose, onAdded }) {
  const { t } = useTranslation();
  const [decks, setDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busyDeckId, setBusyDeckId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [error, setError] = useState('');

  const gameId = card?.gameId;

  useEffect(() => {
    if (!visible || !gameId) return undefined;
    let isMounted = true;

    setIsLoading(true);
    setError('');
    setIsCreating(false);
    setNewDeckName('');
    getDecks(gameId)
      .then((result) => isMounted && setDecks(Array.isArray(result) ? result : []))
      .catch((requestError) => isMounted && setError(requestError.message))
      .finally(() => isMounted && setIsLoading(false));

    return () => {
      isMounted = false;
    };
  }, [visible, gameId]);

  async function addTo(deck) {
    setBusyDeckId(deck.id);
    setError('');
    try {
      await addCardToDeck(deck.id, card.externalId);
      onAdded?.(deck);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyDeckId(null);
    }
  }

  async function createAndAdd() {
    const name = newDeckName.trim();
    if (!name) {
      setError(t('preencha_nome_deck'));
      return;
    }
    setBusyDeckId('new');
    setError('');
    try {
      const { deck } = await createDeck(gameId, name);
      await addCardToDeck(deck.id, card.externalId);
      onAdded?.(deck);
    } catch (requestError) {
      setError(requestError.message || t('erro_criar_deck'));
    } finally {
      setBusyDeckId(null);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('fechar')} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrap}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{t('adicionar_a_deck')}</Text>
          {card?.name ? <Text style={styles.subtitle} numberOfLines={1}>{card.name}</Text> : null}

          {isLoading ? <ActivityIndicator color={colors.gold} style={styles.loading} /> : null}

          {!isLoading ? (
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
              {decks.length === 0 ? (
                <Text style={styles.empty}>{t('sem_decks_deste_jogo')}</Text>
              ) : (
                decks.map((deck) => (
                  <Pressable
                    key={deck.id}
                    style={({ pressed }) => [styles.deckRow, pressed && styles.deckRowPressed]}
                    onPress={() => addTo(deck)}
                    disabled={busyDeckId !== null}
                  >
                    <View style={styles.deckInfo}>
                      <Text style={styles.deckName} numberOfLines={1}>{deck.name}</Text>
                      <Text style={styles.deckMeta}>
                        {t('qtd_cartas', { count: deck._count?.items ?? 0 })}
                      </Text>
                    </View>
                    {busyDeckId === deck.id ? (
                      <ActivityIndicator size="small" color={colors.gold} />
                    ) : (
                      <Text style={styles.deckAction}>＋</Text>
                    )}
                  </Pressable>
                ))
              )}
            </ScrollView>
          ) : null}

          {isCreating ? (
            <View style={styles.createBox}>
              <Field
                label={t('nome_do_deck')}
                value={newDeckName}
                onChangeText={setNewDeckName}
                placeholder={t('nome_deck_placeholder')}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={createAndAdd}
              />
              <Button
                label={busyDeckId === 'new' ? t('carregando') : t('criar_e_adicionar')}
                onPress={createAndAdd}
                disabled={busyDeckId !== null}
                size="sm"
              />
            </View>
          ) : (
            <Button
              label={`＋ ${t('criar_deck_com_carta')}`}
              variant="outline"
              size="sm"
              onPress={() => setIsCreating(true)}
              disabled={isLoading || busyDeckId !== null}
            />
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.scrim },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '80%',
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    backgroundColor: colors.surfaceAmethyst,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.borderStrong,
  },
  title: { ...type.headlineSm, color: colors.textPrimary },
  subtitle: { ...type.bodySm, color: colors.textSecondary, marginTop: -spacing.xs },
  loading: { marginVertical: spacing.lg },
  list: { flexGrow: 0 },
  listContent: { gap: spacing.xs },
  empty: { ...type.bodyMd, color: colors.textMuted, textAlign: 'center', marginVertical: spacing.sm },
  deckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deckRowPressed: { opacity: 0.7 },
  deckInfo: { flex: 1, marginRight: spacing.sm },
  deckName: { ...type.titleMd, color: colors.textPrimary },
  deckMeta: { ...type.labelSm, color: colors.textMuted },
  deckAction: { ...type.titleLg, color: colors.gold },
  createBox: { gap: spacing.xs },
  error: { ...type.bodySm, color: colors.danger, textAlign: 'center' },
});
