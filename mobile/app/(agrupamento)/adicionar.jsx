import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader, Button, Logo, Screen } from '../../components';
import { colors, gradients, radii, shadows, spacing, type } from '../../theme';

export default function Adicionar() {
  const { t } = useTranslation();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);

  async function takePicture() {
    if (!cameraRef.current || !cameraReady || isTakingPhoto) return;

    setIsTakingPhoto(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      setCapturedPhoto(photo);
    } catch {
      Alert.alert('Não foi possível tirar a foto', 'Tente novamente em alguns instantes.');
    } finally {
      setIsTakingPhoto(false);
    }
  }

  function usePhoto() {
    Alert.alert(t('foto_capturada'), t('foto_pronta'), [
      { text: 'OK', onPress: () => setCapturedPhoto(null) },
    ]);
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

      <View style={styles.cameraFrame}>
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

        {capturedPhoto ? (
          <View style={styles.reviewActions}>
            <Button
              label={t('tirar_outra_foto')}
              variant="secondary"
              size="sm"
              onPress={() => setCapturedPhoto(null)}
              style={styles.reviewButton}
            />
            <Button
              label={t('usar_foto')}
              size="sm"
              onPress={usePhoto}
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
