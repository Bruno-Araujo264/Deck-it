import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { addCardToDeck, scanCard } from '../../api/client';
import { AppHeader, Button, Logo, ScanCardReveal, Screen } from '../../components';
import { colors, gradients, radii, shadows, spacing, type } from '../../theme';

const GAME_LABELS = {
  mtg: 'Magic: The Gathering',
  pokemon: 'Pokémon TCG',
  yugioh: 'Yu-Gi-Oh!',
  lorcana: 'Lorcana',
};

/** Carta proporcional ao quadro da câmera, para a janela nunca cobrir a foto inteira. */
function cardWidthFor(frameHeight) {
  if (!frameHeight) return 130;
  return Math.round(Math.min(170, Math.max(100, frameHeight * 0.3)));
}

function cleanCardName(name) {
  return String(name ?? '').replace(/^[^\p{L}]*/u, '');
}

export default function Adicionar() {
  const { t } = useTranslation();
  const { deckId: rawDeckId, gameId: rawGameId } = useLocalSearchParams();
  const deckId = Array.isArray(rawDeckId) ? rawDeckId[0] : rawDeckId;
  const gameId = Array.isArray(rawGameId) ? rawGameId[0] : rawGameId;
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [addedCard, setAddedCard] = useState(null);
  const [addingCardId, setAddingCardId] = useState('');
  const [frameHeight, setFrameHeight] = useState(0);

  function resetScan() {
    setCapturedPhoto(null);
    setScanResult(null);
    setAddedCard(null);
    setAddingCardId('');
  }

  async function takePicture() {
    if (!cameraRef.current || !cameraReady || isTakingPhoto) return;

    setIsTakingPhoto(true);
    try {
      // base64 vai para a IA; qualidade menor deixa o envio leve sem perder a leitura do texto.
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: true });
      setCapturedPhoto(photo);
    } catch {
      Alert.alert('Não foi possível tirar a foto', 'Tente novamente em alguns instantes.');
    } finally {
      setIsTakingPhoto(false);
    }
  }

  async function addToDeck(card) {
    if (!/^\d+$/.test(String(deckId ?? ''))) {
      Alert.alert(t('erro_identificar_carta'), t('deck_nao_selecionado'));
      return;
    }

    setAddingCardId(card.externalId);
    try {
      await addCardToDeck(deckId, card.externalId);
      setAddedCard(card);
    } catch (error) {
      Alert.alert(t('erro_identificar_carta'), error.message);
    } finally {
      setAddingCardId('');
    }
  }

  async function identifyPhoto() {
    if (!capturedPhoto?.base64 || isScanning) return;

    setIsScanning(true);
    try {
      const result = await scanCard({
        base64: capturedPhoto.base64,
        mimeType: capturedPhoto.format === 'png' ? 'image/png' : 'image/jpeg',
        gameId,
      });
      setScanResult(result);

      // Coleção + número batem: é a impressão exata, então registra direto no deck.
      if (result.match && deckId) {
        await addToDeck(result.match);
      }
    } catch (error) {
      Alert.alert(t('erro_identificar_carta'), error.message);
    } finally {
      setIsScanning(false);
    }
  }

  function handleCandidatePress(card) {
    if (deckId) {
      addToDeck(card);
      return;
    }
    openCard(card);
  }

  function openCard(card) {
    router.push({
      pathname: '/carta',
      params: { externalId: card.externalId, gameId: String(card.gameId), source: 'scanner' },
    });
  }

  function goToDeck() {
    if (!/^\d+$/.test(String(deckId ?? ''))) {
      return;
    }

    router.replace({
      pathname: '/decks',
      params: { deckId: String(deckId), source: 'adicionar' },
    });
  }

  function openManualSearch() {
    router.push({
      pathname: '/selecionar-carta',
      params: {
        deckId: deckId ? String(deckId) : undefined,
        gameId: gameId ? String(gameId) : undefined,
      },
    });
  }

  /** Carta que aparece virada na tela: a adicionada, a identificada ou o melhor candidato. */
  function revealedCard() {
    if (addedCard) return addedCard;
    if (!scanResult) return null;
    return scanResult.match ?? scanResult.candidates?.[0] ?? null;
  }

  function renderScanOverlay() {
    const card = revealedCard();
    // Imagem maior possível: a carta revelada aparece grande e não pode ficar borrada.
    const imageUri = card?.imageLarge || card?.imageNormal || card?.imageSmall;
    const status = isScanning ? 'loading' : imageUri ? 'revealed' : 'failed';

    return (
      <View style={styles.revealOverlay} pointerEvents="box-none">
        {/* View simples (sem ScrollView): no iOS o ScrollView se estica e o pop-up ocupava o quadro todo. */}
        <View style={[styles.popup, styles.popupContent]}>
          <ScanCardReveal
            status={status}
            imageUri={imageUri}
            width={cardWidthFor(frameHeight)}
            onPress={card ? () => openCard(card) : undefined}
          />
          {renderScanPanel(card)}
        </View>
      </View>
    );
  }

  function renderScanPanel(card) {
    if (isScanning) {
      return (
        <Text style={styles.loadingLabel}>{t('identificando_carta')}</Text>
      );
    }

    if (addedCard) {
      return (
        <View style={styles.resultPanel}>
          <Text style={[styles.resultTitle, styles.successTitle]}>{t('carta_adicionada_deck')}</Text>
          <Text style={styles.resultText}>
            {cleanCardName(addedCard.name)}
            {addedCard.setName ? ` · ${addedCard.setName}` : ''}
          </Text>
          <View style={styles.resultActions}>
            <Button label={t('tirar_outra_foto')} variant="secondary" size="sm" onPress={resetScan} style={styles.popupButton} />
            <Button label={t('ir_para_deck')} size="sm" onPress={goToDeck} style={styles.popupButton} />
          </View>
        </View>
      );
    }

    const { reading, supported, match, candidates = [] } = scanResult;

    let message = null;
    if (!reading?.isCard || !reading?.name) {
      message = t('carta_nao_reconhecida');
    } else if (!supported) {
      message = t('jogo_nao_suportado', { game: GAME_LABELS[reading.game] ?? reading.game });
    } else if (candidates.length === 0) {
      message = t('carta_nao_encontrada_catalogo', { name: reading.name });
    }

    if (!message && match) {
      return (
        <View style={styles.resultPanel}>
          <Text style={styles.resultTitle}>{t('carta_identificada')}</Text>
          <Text style={styles.resultText}>
            {cleanCardName(match.name)}
            {match.setName ? ` · ${match.setName}` : ''}
          </Text>
          <View style={styles.resultActions}>
            <Button label={t('tirar_outra_foto')} variant="secondary" size="sm" onPress={resetScan} style={styles.popupButton} />
            <Button
              label={addingCardId ? t('carregando') : deckId ? t('adicionar') : t('ver_carta')}
              size="sm"
              onPress={() => handleCandidatePress(match)}
              disabled={Boolean(addingCardId)}
              style={styles.popupButton}
            />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.resultPanel}>
        {message ? (
          <Text style={styles.resultText}>{message}</Text>
        ) : (
          <>
            <Text style={styles.resultTitle}>{t('possiveis_cartas')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.candidateRow}>
              {candidates.map((candidate) => (
                <Pressable
                  key={candidate.externalId}
                  style={({ pressed }) => [styles.candidate, pressed && styles.candidatePressed]}
                  onPress={() => handleCandidatePress(candidate)}
                  disabled={Boolean(addingCardId)}
                >
                  {candidate.imageSmall || candidate.imageNormal ? (
                    <Image source={{ uri: candidate.imageSmall || candidate.imageNormal }} style={styles.candidateImage} resizeMode="contain" />
                  ) : null}
                  <Text style={styles.candidateName} numberOfLines={2}>{cleanCardName(candidate.name)}</Text>
                  <Text style={styles.candidateSet} numberOfLines={1}>
                    {(candidate.setCode ?? '').toUpperCase()} {candidate.collectorNumber ? `#${candidate.collectorNumber}` : ''}
                  </Text>
                  {addingCardId === candidate.externalId ? (
                    <ActivityIndicator size="small" color={colors.gold} />
                  ) : (
                    <Text style={styles.candidateAction}>{deckId ? t('adicionar') : t('ver_carta')}</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}
        <View style={styles.resultActions}>
          <Button label={t('tirar_outra_foto')} variant="secondary" size="sm" onPress={resetScan} style={styles.popupButton} />
          <Button label={t('buscar_manualmente')} variant="outline" size="sm" onPress={openManualSearch} style={styles.popupButton} />
        </View>
      </View>
    );
  }

  function handlePermissionPress() {
    if (permission.canAskAgain) {
      requestPermission();
      return;
    }

    Alert.alert(
      'Permissão bloqueada',
      'A câmera foi recusada. Permita o acesso nas configurações do dispositivo para continuar.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir configurações', onPress: Linking.openSettings },
      ],
    );
  }

  const showOverlay = Boolean(capturedPhoto && (isScanning || scanResult || addedCard));

  if (!permission) {
    return <Screen stardust={false} />;
  }

  if (!permission.granted) {
    return (
      <Screen>
        <View style={styles.permissionScreen}>
          <Logo size={72} withWordmark stacked wordmarkSize={24} style={styles.permissionBrand} />
          <Text style={styles.permissionTitle}>Acesso à câmera</Text>
          <Text style={styles.permissionText}>
            O Deck-it precisa da câmera para fotografar suas cartas.
          </Text>
          <Button
            label="Permitir câmera"
            icon="◎"
            onPress={handlePermissionPress}
            style={styles.permissionButton}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen stardust={false}>
      <AppHeader variant="page" title={t('adicionar_cartas')} onBack={() => router.back()} />

      <Pressable
        style={styles.existingCardsButton}
        onPress={openManualSearch}
      >
        <Text style={styles.existingCardsButtonText}>{t('escolher_carta_existente')}</Text>
      </Pressable>

      <View style={styles.cameraFrame} onLayout={(e) => setFrameHeight(e.nativeEvent.layout.height)}>
        {capturedPhoto ? (
          <Image source={{ uri: capturedPhoto.uri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.preview}
            facing="back"
            mode="picture"
            onCameraReady={() => setCameraReady(true)}
            onMountError={({ message }) => {
              setCameraReady(false);
              Alert.alert('Não foi possível iniciar a câmera', message);
            }}
          />
        )}

        {/* Retícula do scanner: cantos em Ciano Laser, conforme o guia. */}
        {!showOverlay ? (
        <View pointerEvents="none" style={styles.cardGuide}>
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
          <LinearGradient
            colors={gradients.scanLine}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.scanLine}
          />
        </View>
        ) : null}

        {showOverlay ? (
          renderScanOverlay()
        ) : capturedPhoto ? (
          <View style={styles.reviewActions}>
            <Button
              label={t('tirar_outra_foto')}
              variant="secondary"
              size="sm"
              onPress={resetScan}
              style={styles.reviewButton}
            />
            <Button
              label={t('usar_foto')}
              size="sm"
              onPress={identifyPhoto}
              style={styles.reviewButton}
            />
          </View>
        ) : (
          <View style={styles.cameraControls}>
            <Pressable
              style={({ pressed }) => [styles.shutterButton, pressed && styles.shutterPressed]}
              onPress={takePicture}
              accessibilityRole="button"
              accessibilityLabel="Tirar foto"
            >
              <View style={styles.shutterInner} />
            </Pressable>
          </View>
        )}
      </View>
    </Screen>
  );
}

const CORNER = 26;

const styles = StyleSheet.create({
  existingCardsButton: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 11,
    borderRadius: 7,
    alignItems: 'center',
    backgroundColor: '#292d62',
    borderWidth: 1,
    borderColor: '#5c65c8',
  },
  existingCardsButtonText: { color: '#f4f4fb', fontSize: 12, fontWeight: '700' },
  cameraFrame: {
    flex: 1,
    margin: spacing.md,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.bgDeepest,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  preview: { flex: 1, width: '100%' },

  cardGuide: {
    position: 'absolute',
    width: '66%',
    height: '62%',
    left: '17%',
    top: '12%',
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: colors.scannerCyan,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: radii.sm,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: radii.sm,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: radii.sm,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: radii.sm,
  },
  /** Linha de varredura — o feixe horizontal do guia de estilo. */
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 2,
    shadowColor: colors.scannerCyan,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },

  cameraControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterButton: {
    width: 68,
    height: 68,
    borderRadius: radii.pill,
    backgroundColor: colors.gold,
    borderWidth: 3,
    borderColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.gold,
  },
  shutterInner: {
    width: 50,
    height: 50,
    borderRadius: radii.pill,
    backgroundColor: colors.goldLight,
    opacity: 0.6,
  },
  shutterPressed: { transform: [{ scale: 0.92 }] },

  reviewActions: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  reviewButton: { flex: 1 },

  // Pop-up central sobre a foto (mesmo vidro ametista do painel antigo).
  revealOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  popup: {
    width: '86%',
    maxWidth: 340,
    borderRadius: radii.lg,
    // Só a janela é azul translúcida; em volta fica a própria foto.
    backgroundColor: 'rgba(19, 13, 52, 0.72)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadows.card,
  },
  popupContent: {
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  loadingLabel: { ...type.labelLg, color: colors.textSecondary, textAlign: 'center' },
  resultPanel: { alignSelf: 'stretch', gap: spacing.xs },
  successTitle: { color: colors.success },
  resultTitle: { ...type.titleMd, color: colors.textPrimary, textAlign: 'center' },
  resultText: { ...type.bodyMd, color: colors.textSecondary, textAlign: 'center' },
  // Botões empilhados (a janela é estreita); column-reverse deixa a ação principal em cima.
  resultActions: { flexDirection: 'column-reverse', gap: spacing.xs, marginTop: spacing.xs },
  popupButton: { alignSelf: 'stretch' },
  candidateRow: { gap: spacing.xs },
  candidate: {
    width: 112,
    padding: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceAmethyst,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 2,
  },
  candidatePressed: { opacity: 0.7 },
  candidateImage: { width: 96, height: 134 },
  candidateName: { ...type.labelMd, color: colors.textPrimary, textAlign: 'center' },
  candidateSet: { ...type.labelSm, color: colors.textMuted },
  candidateAction: { ...type.labelMd, color: colors.gold },

  permissionScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  permissionBrand: { marginBottom: spacing.lg },
  permissionTitle: {
    ...type.headlineMd,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  permissionText: {
    ...type.bodyMd,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  permissionButton: { marginTop: spacing.lg, minWidth: 220 },
});
