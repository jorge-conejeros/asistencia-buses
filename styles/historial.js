// styles/historial.js
import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export default StyleSheet.create({
  grupo: {
    marginBottom:    spacing.lg,
    backgroundColor: colors.bgSurface,
    borderRadius:    radius.lg,
    borderWidth:     1,
    borderColor:     colors.border,
    overflow:        'hidden',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.05,
    shadowRadius:    3,
    elevation:       2,
  },
  grupoHeader: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  grupoFecha: {
    ...typography.titleSm,
    color:          colors.primary,
    flex:           1,
    textTransform:  'capitalize',
  },
  grupoBadges: { flexDirection: 'row', gap: spacing.md },
  badgePresente: {
    ...typography.titleSm,
    color: colors.success,
  },
  badgeAusente: {
    ...typography.titleSm,
    color: colors.danger,
  },

  // ── Fila de registro ──────────────────────────────────────────
  registro: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  indicador: {
    width:        4,
    height:       36,
    borderRadius: 2,
    marginRight:  spacing.md,
  },
  indicadorPresente: { backgroundColor: colors.success },
  indicadorAusente:  { backgroundColor: colors.danger },
  registroInfo:    { flex: 1 },
  registroNombre:  { ...typography.titleSm },
  registroSub:     { ...typography.caption, marginTop: 1 },
  registroObs: {
    ...typography.caption,
    color:     colors.primary,
    marginTop: 3,
    fontStyle:  'italic',
  },
  registroEstadoPresente: {
    fontSize:   12,
    fontWeight: '700',
    color:      colors.success,
  },
  registroEstadoAusente: {
    fontSize:   12,
    fontWeight: '700',
    color:      colors.danger,
  },
});