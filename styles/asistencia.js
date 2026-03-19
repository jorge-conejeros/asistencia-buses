// styles/asistencia.js
import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export default StyleSheet.create({
  // ── Fecha ─────────────────────────────────────────────────────
  fechaRow: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: spacing.md + 2,
    paddingVertical:   spacing.sm,
    backgroundColor:   colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fechaTexto: {
    ...typography.caption,
    color:         colors.primary,
    fontWeight:    '600',
    textTransform: 'capitalize',
  },
  modoEditarTag: {
    ...typography.caption,
    color:      colors.warning,
    fontWeight: '700',
  },

  // ── Selector de turno ─────────────────────────────────────────
  selectorTurnoContainer: {
    margin:          spacing.md,
    backgroundColor: colors.bgSurface,
    borderRadius:    radius.lg,
    borderWidth:     1,
    borderColor:     colors.border,
    padding:         spacing.lg,
    alignItems:      'center',
  },
  selectorTurnoTitulo: {
    ...typography.titleMd,
    marginBottom: spacing.lg,
    color:        colors.textPrimary,
  },
  selectorTurnoBotones: {
    flexDirection: 'row',
    gap:           spacing.md,
    width:         '100%',
  },
  btnTurno: {
    flex:            1,
    backgroundColor: colors.bgInput,
    borderRadius:    radius.lg,
    borderWidth:     1.5,
    borderColor:     colors.border,
    padding:         spacing.lg,
    alignItems:      'center',
    gap:             spacing.xs,
  },
  btnTurnoYaRegistrado: {
    backgroundColor: colors.successLight,
    borderColor:     colors.successBorder,
  },
  btnTurnoIcono: { fontSize: 32, marginBottom: 4 },
  btnTurnoLabel: {
    ...typography.titleSm,
    color: colors.textPrimary,
  },
  btnTurnoYaTag: {
    fontSize:   10,
    fontWeight: '700',
    color:      colors.success,
    marginTop:  2,
  },

  // ── Barra de turno activo ─────────────────────────────────────
  turnoActivoBar: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: spacing.md + 2,
    paddingVertical:   spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  turnoBarManana: { backgroundColor: '#FFF8E7' },
  turnoBarTarde:  { backgroundColor: '#EEF2FF' },
  turnoActivoTexto: {
    ...typography.titleSm,
    color: colors.textPrimary,
  },
  aviosoCancelar: {
    color:      colors.danger,
    fontSize:   12,
    fontWeight: '700',
  },

  // ── Aviso modo edición ────────────────────────────────────────
  avisoEdicion: {
    flexDirection:     'row',
    marginHorizontal:  spacing.md,
    marginTop:         spacing.sm,
    backgroundColor:   colors.warningLight,
    borderRadius:      radius.md,
    borderLeftWidth:   3,
    borderLeftColor:   colors.warning,
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm,
  },
  avisoEdicionTexto: {
    ...typography.caption,
    color: colors.warning,
    flex:  1,
  },

  // ── Banners de lista registrada ───────────────────────────────
  bannerContainer: {
    flexDirection: 'row',
    alignItems:    'center',
    margin:        spacing.md,
    marginBottom:  spacing.sm,
    borderRadius:  radius.lg,
    borderWidth:   1,
    padding:       spacing.md,
    gap:           spacing.sm + 2,
  },
  bannerManana: {
    backgroundColor: '#FFFBEB',
    borderColor:     '#FCD34D',
  },
  bannerTarde: {
    backgroundColor: '#EEF2FF',
    borderColor:     '#A5B4FC',
  },
  bannerIconoText: { fontSize: 22 },
  bannerInfo:      { flex: 1 },
  bannerTurnoTag: {
    fontSize:      10,
    fontWeight:    '800',
    letterSpacing: 0.8,
    marginBottom:  2,
  },
  tagManana: { color: '#B45309' },
  tagTarde:  { color: '#4338CA' },
  bannerSub: {
    ...typography.caption,
    marginTop: 2,
    color:     colors.textSecondary,
  },
  bannerMeta: {
    ...typography.caption,
    marginTop:  4,
    color:      colors.primary,
    fontWeight: '600',
  },
  bannerMetaEdicion: {
    ...typography.caption,
    marginTop:  2,
    color:      colors.warning,
    fontWeight: '500',
    fontStyle:  'italic',
  },
  bannerBotones:  { flexDirection: 'column', gap: spacing.sm - 2 },
  btnVerLista: {
    backgroundColor:   colors.bgSurface,
    borderRadius:      radius.sm + 1,
    borderWidth:       1,
    borderColor:       colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical:   5,
    alignItems:        'center',
  },
  btnVerListaText:    { color: colors.primary, fontWeight: '600', fontSize: 12 },
  btnEditarLista: {
    backgroundColor:   colors.warningLight,
    borderRadius:      radius.sm + 1,
    borderWidth:       1,
    borderColor:       colors.warningBorder,
    paddingHorizontal: spacing.md,
    paddingVertical:   5,
    alignItems:        'center',
  },
  btnEditarListaText: { color: colors.warning, fontWeight: '600', fontSize: 12 },

  // ── Filtro cursos ─────────────────────────────────────────────
  cursosRow: {
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm,
    gap:               spacing.sm,
  },

  // ── Estadísticas ──────────────────────────────────────────────
  statsRow: {
    flexDirection:    'row',
    marginHorizontal: spacing.md,
    marginBottom:     spacing.sm,
    gap:              spacing.sm,
  },
  statBox: {
    flex:            1,
    backgroundColor: colors.bgSurface,
    borderRadius:    radius.md,
    borderWidth:     1,
    borderColor:     colors.border,
    padding:         spacing.sm + 2,
    alignItems:      'center',
  },
  statValue:  { fontSize: 20, fontWeight: '800' },
  statLabel:  { ...typography.muted, fontSize: 10, marginTop: 2, fontWeight: '500' },
});