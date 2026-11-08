import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii, sizes, spacing, type } from '../theme';

/**
 * Campo de busca do app (Home, Busca, Detalhes do deck).
 * Repassa qualquer prop extra direto para o TextInput.
 */
export default function SearchField({ style, ...inputProps }) {
  return (
    <View style={[styles.box, style]}>
      <Text style={styles.icon}>⌕</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: sizes.field,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.glass,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: { color: colors.textSecondary, fontSize: 22, marginTop: -2 },
  input: {
    flex: 1,
    padding: 0,
    color: colors.textPrimary,
    ...type.bodyMd,
  },
});
