import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors } from '../theme';

/**
 * Fundo global do app: "Noite Encantada para Violeta Profundo".
 *
 * Duas camadas, como no protótipo:
 *   1. gradiente linear vertical  (#14103A → #2A1A63)
 *   2. halo radial no topo, montado com gradientes circulares translúcidos
 *      — o CSS do protótipo é `radial-gradient(circle at 50% 0%, …)`, que
 *      não existe nativamente no RN.
 *
 * @param {boolean} stardust pontinhos de poeira estelar sobre o halo
 */
export default function ScreenBackground({ children, stardust = true, style }) {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={[colors.bgNight, colors.deepViolet]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {HALOS.map((halo, index) => {
          const size = width * halo.scale;
          return (
            <LinearGradient
              key={index}
              colors={[colors.haloCore, colors.haloFade]}
              start={{ x: 0.5, y: 0.1 }}
              end={{ x: 0.5, y: 1 }}
              style={[
                styles.halo,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  left: (width - size) / 2,
                  top: -size * halo.lift,
                  opacity: halo.opacity,
                },
              ]}
            />
          );
        })}

        {stardust
          ? STARDUST.map((star, index) => (
              <View
                key={`star-${index}`}
                style={[
                  styles.star,
                  {
                    left: `${star.x}%`,
                    top: star.y,
                    width: star.r,
                    height: star.r,
                    borderRadius: star.r / 2,
                    backgroundColor: star.color,
                    opacity: star.opacity,
                  },
                ]}
              />
            ))
          : null}
      </View>

      {children}
    </View>
  );
}

/** Camadas do halo: quanto mais interna, mais clara fica a soma. */
const HALOS = [
  { scale: 2.1, lift: 0.62, opacity: 0.5 },
  { scale: 1.6, lift: 0.5, opacity: 0.4 },
  { scale: 1.15, lift: 0.4, opacity: 0.32 },
  { scale: 0.7, lift: 0.3, opacity: 0.28 },
];

/** Poeira estelar discreta (posições fixas, custo zero de render). */
const STARDUST = [
  { x: 14, y: 96, r: 2, color: colors.gold, opacity: 0.45 },
  { x: 83, y: 72, r: 3, color: colors.lavender, opacity: 0.35 },
  { x: 46, y: 148, r: 2, color: colors.pokemon, opacity: 0.4 },
  { x: 69, y: 198, r: 2.5, color: colors.lavender, opacity: 0.3 },
  { x: 27, y: 212, r: 1.8, color: colors.gold, opacity: 0.35 },
  { x: 92, y: 132, r: 2, color: colors.lavender, opacity: 0.28 },
  { x: 8, y: 260, r: 2, color: colors.scannerCyan, opacity: 0.22 },
  { x: 60, y: 54, r: 1.6, color: colors.gold, opacity: 0.3 },
];

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgDeep },
  halo: { position: 'absolute' },
  star: { position: 'absolute' },
});
