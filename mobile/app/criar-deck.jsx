import { useEffect, useState } from 'react';
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
import { AppHeader, Button, Field, GlassCard, Screen, SectionLabel } from '../components';
import { colors, radii, sizes, spacing, type } from '../theme';
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
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <AppHeader
          variant="page"
          title={t('criar_deck')}
          onBack={() => router.back()}
          right={
            <Button
              label={t('cancelar')}
              variant="ghost"
              size="sm"
              onPress={() => router.back()}
            />
          }
        />

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Field
            label={t('nome_do_deck')}
            value={name}
            onChangeText={setName}
            placeholder={t('nome_deck_placeholder')}
            autoCapitalize="sentences"
          />

          <View style={styles.spaced}>
            <Text style={styles.label}>{t('tipo_de_jogo')}</Text>
            <Pressable
              style={[styles.select, isGamePickerOpen && styles.selectOpen]}
              onPress={() => setIsGamePickerOpen((open) => !open)}
              disabled={isLoading}
            >
              <Text style={[styles.selectText, !selectedGame && styles.placeholder]}>
                {isLoading ? t('carregando') : selectedGame?.name ?? t('selecione_um_jogo')}
              </Text>
              <Text style={styles.chevron}>{isGamePickerOpen ? '⌃' : '⌄'}</Text>
            </Pressable>

            {isGamePickerOpen ? (
              <GlassCard style={styles.gameOptions}>
                {games.length === 0 ? (
                  <Text style={styles.optionEmpty}>{t('nenhum_jogo_disponivel')}</Text>
                ) : (
                  games.map((game, index) => (
                    <Pressable
                      key={game.id}
                      style={[styles.option, index < games.length - 1 && styles.optionBorder]}
                      onPress={() => {
                        setSelectedGame(game);
                        setIsGamePickerOpen(false);
                      }}
                    >
                      <Text style={styles.optionText}>{game.name}</Text>
                    </Pressable>
                  ))
                )}
              </GlassCard>
            ) : null}
          </View>

          <Field
            label={t('descricao_opcional')}
            value={description}
            onChangeText={setDescription}
            placeholder={t('descricao_placeholder')}
            multiline
            textAlignVertical="top"
            style={styles.descriptionBox}
            containerStyle={styles.spaced}
          />

          <SectionLabel style={styles.section}>{t('cartas_no_deck')}</SectionLabel>
          <Button
            label={t('adicionar_cartas')}
            icon="+"
            variant="outline"
            full
            onPress={() => router.push('/selecionar-carta')}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            label={isSaving ? t('carregando') : t('criar_deck')}
            onPress={handleCreateDeck}
            disabled={isSaving}
            full
            style={styles.submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  spaced: { marginTop: spacing.md },
  label: {
    ...type.overline,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
    marginLeft: spacing.xxs,
  },
  select: {
    height: sizes.field,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectOpen: {
    borderColor: colors.gold,
    backgroundColor: colors.glassElevated,
  },
  selectText: { flex: 1, ...type.bodyMd, color: colors.textPrimary },
  placeholder: { color: colors.textMuted },
  chevron: { color: colors.textSecondary, fontSize: 17 },
  gameOptions: {
    marginTop: spacing.xxs,
    padding: 0,
    overflow: 'hidden',
  },
  option: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  optionBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  optionText: { ...type.bodyMd, color: colors.textPrimary },
  optionEmpty: {
    ...type.bodyMd,
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  descriptionBox: { height: 96 },
  section: { marginTop: spacing.lg },
  errorText: {
    ...type.bodySm,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  submit: { marginTop: spacing.lg },
});
