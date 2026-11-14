import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, View } from 'react-native';
import { colors, gradients, radii, shadows } from '../theme';
import Logo from './Logo';

const CARD_RATIO = 88 / 63; // proporção padrão de carta de TCG (63 x 88 mm)
const IDLE_SCALE = 0.77; // tamanho da carta de costas em relação à revelada

/**
 * Carta do scanner:
 *  - status "loading":  verso do Deck-it flutuando, com o feixe do scanner varrendo a carta
 *  - status "revealed": a carta vira (flip 3D) mostrando a frente e cresce até o tamanho final
 *  - status "failed":   o verso dá uma "tremidinha" e continua de costas
 *
 * `width` é a largura FINAL (carta revelada). A carta é desenhada nesse tamanho e começa
 * reduzida: assim a imagem é carregada em resolução cheia e não fica borrada ao crescer
 * (o React Native decodifica a imagem no tamanho da caixa, e "scale" só estica os pixels).
 */
export default function ScanCardReveal({ status = 'loading', imageUri, width = 160, onPress, style }) {
  const height = width * CARD_RATIO;
  const idle = useRef(new Animated.Value(0.5)).current; // 0..1, 0.5 = parado no centro
  const sweep = useRef(new Animated.Value(0)).current; // feixe do scanner: 0 = topo, 1 = base
  const flip = useRef(new Animated.Value(0)).current; // 0 = verso, 1 = frente
  const shake = useRef(new Animated.Value(0)).current;
  const [loadedUri, setLoadedUri] = useState(null); // imagem da frente já decodificada
  const [flippedUri, setFlippedUri] = useState(null); // imagem que já foi revelada
  const [timedOut, setTimedOut] = useState(false);

  // Identificando: flutua, balança e o feixe ciano varre a carta.
  useEffect(() => {
    if (status !== 'loading') return undefined;
    flip.setValue(0);
    setFlippedUri(null);
    setTimedOut(false);
    const ease = Easing.inOut(Easing.sin);
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(idle, { toValue: 1, duration: 900, easing: ease, useNativeDriver: true }),
        Animated.timing(idle, { toValue: 0, duration: 1800, easing: ease, useNativeDriver: true }),
        Animated.timing(idle, { toValue: 0.5, duration: 900, easing: ease, useNativeDriver: true }),
      ]),
    );
    const scan = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, { toValue: 1, duration: 1100, easing: ease, useNativeDriver: true }),
        Animated.timing(sweep, { toValue: 0, duration: 1100, easing: ease, useNativeDriver: true }),
      ]),
    );
    float.start();
    scan.start();
    return () => {
      float.stop();
      scan.stop();
    };
  }, [status, idle, sweep, flip]);

  const wantsReveal = status === 'revealed' && Boolean(imageUri) && flippedUri !== imageUri;

  // Vira assim que a imagem chegar (download via prefetch OU decodificação via onLoad,
  // o que vier primeiro). Se a rede estiver lenta, não espera mais que 1 s.
  useEffect(() => {
    if (!wantsReveal) return undefined;
    let cancelled = false;
    Image.prefetch(imageUri)
      .then(() => !cancelled && setLoadedUri(imageUri))
      .catch(() => {});
    const timer = setTimeout(() => setTimedOut(true), 1000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [wantsReveal, imageUri]);

  // A imagem da frente fica montada (escondida) desde já, então costuma estar
  // decodificada quando o giro passa da metade e ela aparece nítida.
  useEffect(() => {
    if (!wantsReveal || (loadedUri !== imageUri && !timedOut)) return;
    setFlippedUri(imageUri);
    Animated.sequence([
      Animated.timing(idle, { toValue: 0.5, duration: 200, useNativeDriver: true }),
      Animated.spring(flip, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }),
    ]).start();
  }, [wantsReveal, loadedUri, imageUri, timedOut, idle, flip]);

  // Não identificou: tremidinha de "não deu".
  useEffect(() => {
    if (status !== 'failed') return;
    Animated.timing(idle, { toValue: 0.5, duration: 150, useNativeDriver: true }).start();
    shake.setValue(0);
    Animated.sequence(
      [1, -1, 0.6, -0.6, 0].map((toValue) =>
        Animated.timing(shake, { toValue, duration: 70, useNativeDriver: true }),
      ),
    ).start();
  }, [status, idle, shake]);

  const floatY = idle.interpolate({ inputRange: [0, 1], outputRange: [6, -6] });
  const wobble = idle.interpolate({ inputRange: [0, 1], outputRange: ['-12deg', '12deg'] });
  const scale = flip.interpolate({ inputRange: [0, 1], outputRange: [IDLE_SCALE, 1] });
  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-10, 10] });
  const backRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const frontRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  // backfaceVisibility nem sempre funciona no Android: a opacidade troca as faces no meio do giro.
  const backOpacity = flip.interpolate({ inputRange: [0, 0.5, 0.501, 1], outputRange: [1, 1, 0, 0] });
  const frontOpacity = flip.interpolate({ inputRange: [0, 0.5, 0.501, 1], outputRange: [0, 0, 1, 1] });
  const glare = idle.interpolate({ inputRange: [0, 1], outputRange: [-width, width] });
  const beamY = sweep.interpolate({ inputRange: [0, 1], outputRange: [0, height - 14] });

  const face = { width, height, borderRadius: radii.md };

  return (
    <Animated.View
      style={[
        { width, height },
        style,
        { transform: [{ perspective: 1000 }, { translateY: floatY }, { translateX: shakeX }, { rotateY: wobble }, { scale }] },
      ]}
    >
      <Pressable onPress={onPress} disabled={!onPress || status !== 'revealed'} style={StyleSheet.absoluteFill}>
        {/* Verso */}
        <Animated.View
          style={[styles.face, face, { opacity: backOpacity, transform: [{ perspective: 1000 }, { rotateY: backRotate }] }]}
        >
          <LinearGradient
            colors={[colors.deepViolet, colors.bgDeepest, colors.deepViolet]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, styles.back]}
          >
            <View style={styles.backFrame}>
              <View style={styles.backInnerFrame}>
                <Logo size={width * 0.36} />
              </View>
            </View>
            <Animated.View pointerEvents="none" style={[styles.glare, { transform: [{ translateX: glare }, { rotate: '20deg' }] }]}>
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.16)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            {status === 'loading' ? (
              <Animated.View pointerEvents="none" style={[styles.beam, { transform: [{ translateY: beamY }] }]}>
                <LinearGradient
                  colors={['rgba(62, 231, 242, 0)', 'rgba(62, 231, 242, 0.22)', 'rgba(62, 231, 242, 0)']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.beamGlow}
                />
                <LinearGradient colors={gradients.scanLine} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.beamLine} />
              </Animated.View>
            ) : null}
          </LinearGradient>
        </Animated.View>

        {/* Frente */}
        <Animated.View
          style={[styles.face, styles.front, face, { opacity: frontOpacity, transform: [{ perspective: 1000 }, { rotateY: frontRotate }] }]}
        >
          {status === 'revealed' && imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              fadeDuration={0}
              onLoad={() => setLoadedUri(imageUri)}
              onError={() => setTimedOut(true)}
            />
          ) : null}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    borderWidth: 2,
    borderColor: colors.gold,
    ...shadows.gold,
  },
  back: { padding: 8 },
  backFrame: {
    flex: 1,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: `${colors.gold}88`,
    padding: 6,
  },
  backInnerFrame: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.xs,
    borderWidth: 1,
    borderColor: `${colors.scannerCyan}55`,
    backgroundColor: 'rgba(62, 231, 242, 0.04)',
  },
  glare: { position: 'absolute', top: -40, bottom: -40, width: 60 },
  beam: { position: 'absolute', left: 0, right: 0, top: 0, height: 14, justifyContent: 'center' },
  beamGlow: { ...StyleSheet.absoluteFill },
  beamLine: {
    height: 2,
    shadowColor: colors.scannerCyan,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  front: { backgroundColor: colors.bgDeepest },
});
