import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function Adicionar() {
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
    Alert.alert('Carta fotografada', 'A foto está pronta para ser adicionada ao seu deck.', [
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
    return <View style={styles.loading} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <StatusBar style="light" />
        <Text style={styles.permissionTitle}>Acesso à câmera</Text>
        <Text style={styles.permissionText}>
          O Deck-it precisa da câmera para fotografar suas cartas.
        </Text>
        <Pressable style={styles.permissionButton} onPress={handlePermissionPress}>
          <Text style={styles.permissionButtonText}>Permitir câmera</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Adicionar Carta</Text>
      </View>

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
        <View pointerEvents="none" style={styles.cardGuide} />

        {capturedPhoto ? (
          <View style={styles.reviewActions}>
            <Pressable style={styles.secondaryButton} onPress={() => setCapturedPhoto(null)}>
              <Text style={styles.secondaryButtonText}>Tirar outra</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={usePhoto}>
              <Text style={styles.primaryButtonText}>Usar foto</Text>
            </Pressable>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#101126' },
  loading: { flex: 1, backgroundColor: '#101126' },
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#292d62',
  },
  backButton: {
    width: 22,
    height: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#292d62',
    marginRight: 9,
  },
  backIcon: { color: '#d7d8ea', fontSize: 22, lineHeight: 19, marginTop: -2 },
  title: { color: '#f4f4fb', fontSize: 14, fontWeight: '800' },
  cameraFrame: {
    flex: 1,
    margin: 16,
    marginBottom: 0,
    overflow: 'hidden',
    backgroundColor: '#202020',
  },
  preview: { flex: 1, width: '100%' },
  cardGuide: {
    position: 'absolute',
    width: '64%',
    height: '72%',
    left: '18%',
    top: '14%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 8,
  },
  cameraControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  shutterButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f0f2',
    borderWidth: 3,
    borderColor: '#050509',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f0f0f2' },
  shutterPressed: { transform: [{ scale: 0.92 }] },
  reviewActions: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 20,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'transparent',
  },
  primaryButton: {
    flex: 1,
    height: 42,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#5c65c8',
  },
  secondaryButton: {
    flex: 1,
    height: 42,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#5c65c8',
    backgroundColor: 'transparent',
  },
  primaryButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  secondaryButtonText: { color: '#d7d8ea', fontSize: 12, fontWeight: '700' },
  permissionScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#101126',
  },
  permissionTitle: { color: '#f4f4fb', fontSize: 20, fontWeight: '800', marginBottom: 10 },
  permissionText: { color: '#a2a5cf', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  permissionButton: {
    marginTop: 22,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 7,
    backgroundColor: '#5c65c8',
  },
  permissionButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
