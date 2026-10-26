import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii, sizes, spacing, type } from '../theme';

/**
 * Campo de formulário com rótulo (login, cadastro).
 * Com `secure`, inclui o botão de mostrar/ocultar senha.
 *
 * Qualquer prop extra vai para o TextInput.
 */
const Field = forwardRef(function Field(
  { label, secure = false, style, containerStyle, ...inputProps },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.box, focused && styles.boxFocused, style]}>
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secure && !visible}
          onFocus={(event) => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
          {...inputProps}
        />
        {secure ? (
          <Pressable
            style={styles.eyeButton}
            onPress={() => setVisible((shown) => !shown)}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
            hitSlop={6}
          >
            <Text style={styles.eye}>{visible ? '◉' : '◌'}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

export default Field;

const styles = StyleSheet.create({
  label: {
    ...type.overline,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
    marginLeft: spacing.xxs,
  },
  box: {
    height: sizes.field,
    borderRadius: radii.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  boxFocused: {
    borderColor: colors.gold,
    backgroundColor: colors.glassElevated,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    ...type.bodyMd,
  },
  eyeButton: {
    width: 44,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eye: { color: colors.textSecondary, fontSize: 18 },
});
