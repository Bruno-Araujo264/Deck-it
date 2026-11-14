import { LinearGradient } from 'expo-linear-gradient';
import { usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getToken, sendChatMessage } from '../api/client';
import { colors, gradients, radii, shadows, sizes, spacing, type } from '../theme';
import Logo from './Logo';

/** Telas sem o assistente (antes do login). */
const HIDDEN_ROUTES = ['/', '/login', '/cadastro'];
/** Telas com a barra de abas: o botão sobe para não cobrir a barra. */
const TAB_ROUTES = ['/home', '/buscar', '/adicionar', '/decks', '/perfil'];

const SUGGESTIONS = ['sugestao_comprar', 'sugestao_eventos', 'sugestao_curiosidade', 'sugestao_scanner'];

let nextId = 1;
const newMessage = (role, text, extra = {}) => ({ id: String(nextId++), role, text, ...extra });

/**
 * Botão flutuante + janela de conversa do "Mago do Deck-it".
 * Fica montado no layout raiz, então acompanha o app todo e mantém a conversa
 * enquanto o usuário navega. Só aparece depois do login (há token salvo).
 */
export default function ChatbotWidget() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [hasSession, setHasSession] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef(null);

  const isHiddenRoute = HIDDEN_ROUTES.includes(pathname);

  // Revalida a sessão a cada troca de tela (login/logout mudam o token).
  useEffect(() => {
    let isMounted = true;
    if (isHiddenRoute) {
      setHasSession(false);
      setIsOpen(false);
      return undefined;
    }
    getToken()
      .then((token) => isMounted && setHasSession(Boolean(token)))
      .catch(() => isMounted && setHasSession(false));
    return () => {
      isMounted = false;
    };
  }, [pathname, isHiddenRoute]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages, isSending, isOpen]);

  async function send(text, baseMessages = messages) {
    const content = (text ?? draft).trim();
    if (!content || isSending) return;

    const history = [...baseMessages.filter((m) => !m.error), newMessage('user', content)];
    setMessages(history);
    setDraft('');
    setIsSending(true);
    try {
      const { reply } = await sendChatMessage(history.map(({ role, text: body }) => ({ role, text: body })));
      setMessages((current) => [...current, newMessage('assistant', reply)]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        newMessage('assistant', error.message || t('chat_erro'), { error: true, retryText: content }),
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function retry(message) {
    // Remove a pergunta que falhou e a mensagem de erro, e envia a pergunta de novo.
    const index = messages.findIndex((m) => m.id === message.id);
    send(message.retryText, messages.slice(0, Math.max(0, index - 1)));
  }

  if (!hasSession || isHiddenRoute) return null;

  const onTabScreen = TAB_ROUTES.includes(pathname);
  const fabBottom = (onTabScreen ? sizes.tabBar : 0) + insets.bottom + spacing.sm;

  return (
    <>
      {!isOpen ? (
        <Pressable
          onPress={() => setIsOpen(true)}
          style={({ pressed }) => [styles.fab, { bottom: fabBottom }, pressed && styles.fabPressed]}
          accessibilityRole="button"
          accessibilityLabel={t('chat_abrir')}
        >
          <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fabInner}>
            <Text style={styles.fabIcon}>✦</Text>
          </LinearGradient>
        </Pressable>
      ) : null}

      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)} accessibilityLabel={t('fechar')} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.sheetWrap} pointerEvents="box-none">
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.sm }]}>
            <View style={styles.header}>
              <Logo size={30} />
              <View style={styles.headerText}>
                <Text style={styles.title}>{t('chat_titulo')}</Text>
                <Text style={styles.subtitle}>{t('chat_subtitulo')}</Text>
              </View>
              {messages.length ? (
                <Pressable onPress={() => setMessages([])} hitSlop={8} style={styles.headerButton} accessibilityLabel={t('chat_limpar')}>
                  <Text style={styles.headerButtonText}>{t('chat_limpar')}</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={() => setIsOpen(false)} hitSlop={8} style={styles.closeButton} accessibilityLabel={t('fechar')}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(m) => m.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>{t('chat_boas_vindas')}</Text>
                  <View style={styles.suggestions}>
                    {SUGGESTIONS.map((key) => (
                      <Pressable key={key} style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]} onPress={() => send(t(key))}>
                        <Text style={styles.chipText}>{t(key)}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              }
              renderItem={({ item }) => (
                <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.botBubble, item.error && styles.errorBubble]}>
                  <Text style={[styles.bubbleText, item.role === 'user' && styles.userText]} selectable>
                    {item.text}
                  </Text>
                  {item.error ? (
                    <Pressable onPress={() => retry(item)} hitSlop={6}>
                      <Text style={styles.retry}>{t('chat_tentar_novamente')}</Text>
                    </Pressable>
                  ) : null}
                </View>
              )}
              ListFooterComponent={isSending ? <TypingIndicator /> : null}
            />

            <View style={styles.inputRow}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={t('chat_placeholder')}
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                multiline
                maxLength={1500}
                onSubmitEditing={() => send()}
                blurOnSubmit={false}
              />
              <Pressable
                onPress={() => send()}
                disabled={!draft.trim() || isSending}
                style={({ pressed }) => [styles.sendButton, (!draft.trim() || isSending) && styles.sendDisabled, pressed && styles.fabPressed]}
                accessibilityLabel={t('chat_enviar')}
              >
                <Text style={styles.sendIcon}>➤</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

/** Três pontinhos pulsando enquanto o assistente responde. */
function TypingIndicator() {
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    const loops = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, { toValue: 1, duration: 320, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 320, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.delay((2 - i) * 160),
        ]),
      ),
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [dots]);

  return (
    <View style={[styles.bubble, styles.botBubble, styles.typing]}>
      {dots.map((dot, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: dot, transform: [{ scale: dot }] }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    ...shadows.gold,
  },
  fabInner: {
    flex: 1,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.goldLight,
  },
  fabIcon: { fontSize: 26, color: colors.textOnLight, marginTop: -2 },
  fabPressed: { transform: [{ scale: 0.92 }] },

  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.scrim },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    height: '78%',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    backgroundColor: colors.bgDeep,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.glassHeader,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: { flex: 1 },
  title: { ...type.titleMd, color: colors.textPrimary },
  subtitle: { ...type.labelSm, color: colors.textMuted },
  headerButton: { paddingHorizontal: spacing.xs, paddingVertical: 4 },
  headerButtonText: { ...type.labelMd, color: colors.lavender },
  closeButton: { padding: 4 },
  closeText: { fontSize: 18, color: colors.textSecondary },

  list: { flex: 1 },
  listContent: { padding: spacing.md, gap: spacing.xs, flexGrow: 1 },
  bubble: { maxWidth: '86%', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radii.md },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.gold, borderBottomRightRadius: 4 },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAmethyst,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  errorBubble: { borderColor: `${colors.danger}88` },
  bubbleText: { ...type.bodyMd, color: colors.textPrimary },
  userText: { color: colors.textOnLight },
  retry: { ...type.labelMd, color: colors.gold, marginTop: 4 },
  typing: { flexDirection: 'row', gap: 6, paddingVertical: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.lavender },

  empty: { flex: 1, justifyContent: 'center', gap: spacing.md },
  emptyText: { ...type.bodyMd, color: colors.textSecondary, textAlign: 'center' },
  suggestions: { gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: `${colors.gold}66`,
    backgroundColor: colors.surface,
  },
  chipPressed: { opacity: 0.7 },
  chipText: { ...type.labelLg, color: colors.textPrimary, textAlign: 'center' },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: spacing.sm,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAmethyst,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    ...type.bodyMd,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
  },
  sendDisabled: { opacity: 0.4 },
  sendIcon: { fontSize: 18, color: colors.textOnLight },
});
