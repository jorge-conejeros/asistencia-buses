// styles/alumnoItem.js
import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default StyleSheet.create({
  // ── Fila principal ────────────────────────────────────────────
  fila: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  colors.bgSurface,
    marginHorizontal: spacing.md,
    marginVertical:   3,
    borderRadius:     radius.md,
    borderWidth:      1,
    borderColor:      colors.border,
    overflow:         'hidden',      // para que el indicador lateral no salga del borde
    flexWrap:         'wrap',        // permite que obsInput baje a la siguiente línea
  },
  // Tinte sutil cuando está marcado
  filaPresente: { borderColor: colors.successBorder, backgroundColor: '#FAFFFE' },
  filaAusente:  { borderColor: colors.dangerBorder,  backgroundColor: '#FFFAFA' },

  // ── Indicador lateral de color ────────────────────────────────
  indicador: {
    width:          4,
    alignSelf:      'stretch',
    backgroundColor: colors.border,
  },
  indPresente: { backgroundColor: colors.success },
  indAusente:  { backgroundColor: colors.danger  },

  // ── Info: nombre + curso ──────────────────────────────────────
  info: {
    flex:             1,
    paddingVertical:  spacing.sm + 1,
    paddingLeft:      spacing.sm + 2,
    paddingRight:     spacing.xs,
  },
  nombre: {
    fontSize:   13,
    fontWeight: '600',
    color:      colors.textPrimary,
    lineHeight: 17,
  },
  curso: {
    fontSize: 10,
    color:    colors.textMuted,
    marginTop: 1,
  },

  // ── Botones de acción ─────────────────────────────────────────
  acciones: {
    flexDirection: 'row',
    alignItems:    'center',
    paddingRight:  spacing.sm,
    gap:           spacing.xs,
  },
  btn: {
    width:           38,
    height:          30,
    borderRadius:    radius.sm,
    borderWidth:     1,
    borderColor:     colors.border,
    backgroundColor: colors.bgBase,
    justifyContent:  'center',
    alignItems:      'center',
  },
  btnPresente: {
    backgroundColor: colors.successLight,
    borderColor:     colors.success,
  },
  btnAusente: {
    backgroundColor: colors.dangerLight,
    borderColor:     colors.danger,
  },
  btnText: {
    fontSize:   14,
    fontWeight: '700',
    color:      colors.textMuted,
  },
  btnTextPresente: { color: colors.success },
  btnTextAusente:  { color: colors.danger  },

  // ── Botón observación ─────────────────────────────────────────
  btnObs: {
    width:           28,
    height:          30,
    borderRadius:    radius.sm,
    justifyContent:  'center',
    alignItems:      'center',
  },
  btnObsActiva:     {},
  btnObsText:       { fontSize: 13, color: colors.textMuted },
  btnObsTextActiva: { fontSize: 13 },

  // ── Campo observación (se expande debajo de la fila) ──────────
  obsInput: {
    width:             '100%',
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm,
    borderTopWidth:    1,
    borderTopColor:    colors.border,
    backgroundColor:   colors.bgInput,
    color:             colors.textPrimary,
    fontSize:          12,
    minHeight:         40,
    textAlignVertical: 'top',
  },
});