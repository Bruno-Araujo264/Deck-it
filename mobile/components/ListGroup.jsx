import { Children, cloneElement, isValidElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadows, spacing, type } from '../theme';

/**
 * Bloco de linhas agrupadas (estilo "ajustes"): um cartão de vidro que
 * desenha sozinho os divisores entre os filhos.
 *
 *   <ListGroup>
 *     <ListRow icon="♙" label="Nome" value="Bruno Mars" onPress={...} />
 *     <ListRow icon="◎" label="Idioma" value="Português" />
 *   </ListGroup>
 */
export function ListGroup({ children, style }) {
  const rows = Children.toArray(children).filter(Boolean);

  return (
    <View style={[styles.group, style]}>
      {rows.map((row, index) =>
        isValidElement(row)
          ? cloneElement(row, { key: row.key ?? index, _last: index === rows.length - 1 })
          : row,
      )}
    </View>
  );
}

/**
 * Linha de um ListGroup.
 *
 * @param {string}  icon    glifo à esquerda
 * @param {string}  label   texto principal
 * @param {string}  value   valor à direita (texto)
 * @param {Node}    right   conteúdo à direita no lugar do valor (Switch, input…)
 * @param {boolean} chevron mostra o "›" de navegação
 * @param {boolean} danger  pinta a linha com a cor de alerta
 */
export function ListRow({
  icon,
  label,
  value,
  right,
  chevron = false,
  danger = false,
  onPress,
  style,
  _last = false,
}) {
  const tint = danger ? colors.danger : colors.gold;
  const baseStyle = [styles.row, !_last && styles.rowBorder, style];

  const content = (
    <>
      {icon ? (
        <View style={styles.iconSlot}>
          <Text style={[styles.icon, { color: tint }]}>{icon}</Text>
        </View>
      ) : null}

      <Text style={[styles.label, danger && styles.dangerLabel]} numberOfLines={1}>
        {label}
      </Text>

      {right ?? (value != null ? <Text style={styles.value} numberOfLines={1}>{value}</Text> : null)}

      {chevron ? <Text style={styles.chevron}>›</Text> : null}
    </>
  );

  // Linha estática (ex.: a do Switch) é um View — só o Pressable aceita
  // `style` como função.
  if (!onPress) return <View style={baseStyle}>{content}</View>;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [...baseStyle, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  row: {
    minHeight: 52,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  pressed: { backgroundColor: colors.surfaceElevated },
  iconSlot: { width: 26, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 16 },
  label: { ...type.bodyMd, color: colors.textPrimary, flex: 1 },
  dangerLabel: { color: colors.danger, fontFamily: fonts.bodySemiBold },
  value: { ...type.bodySm, color: colors.textSecondary, maxWidth: '45%' },
  chevron: { color: colors.textMuted, fontSize: 22, lineHeight: 24, marginLeft: 2 },
});

export default ListGroup;
