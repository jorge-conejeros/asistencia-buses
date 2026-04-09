// styles/alumnos.js
import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export default StyleSheet.create({
  // ── Secciones ─────────────────────────────────────────────────
  seccionHeaderToggle: {
    paddingHorizontal: spacing.md + 2,
    paddingVertical:   spacing.md - 2,
    backgroundColor:   colors.bgElevated,
    borderTopWidth:    1,
    borderTopColor:    colors.border,
    marginTop:         spacing.md,
    marginBottom:      spacing.xs,
  },
  seccionTituloToggle: {
    ...typography.titleSm,
    color: colors.textSecondary,
  },

  // ── Fila alumno ───────────────────────────────────────────────
  fila: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.bgSurface,
    marginHorizontal: spacing.md,
    marginVertical:  4,
    borderRadius:    radius.md,
    borderWidth:     1,
    borderColor:     colors.border,
    padding:         spacing.md - 2,
    gap:             spacing.sm + 2,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.04,
    shadowRadius:    2,
    elevation:       1,
  },
  filaInactiva: { opacity: 0.55 },
  filaInfo:     { flex: 1 },
  filaNombre:   { ...typography.titleSm, marginBottom: 4 },
  filaNombreInactivo: {
    color:              colors.inactiveText,
    textDecorationLine: 'line-through',
  },
  filaCursoRow: {
    flexDirection: 'row',
    gap:           spacing.sm - 2,
    alignItems:    'center',
  },

  // Badge inactivo
  bajaBadge: {
    backgroundColor: colors.dangerLight,
    borderRadius:    radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical:   2,
  },
  bajaBadgeText: {
    color:      colors.danger,
    fontSize:   10,
    fontWeight: '700',
  },

  // ── Acciones por fila ─────────────────────────────────────────
  filaAcciones: {
    flexDirection:  'row',
    gap:            spacing.sm - 2,
    alignItems:     'center',
    flexShrink:     0,       // evita que el área se comprima
    zIndex:         10,      // queda sobre filaInfo
  },
  btnEditar: {
    backgroundColor:  colors.bgInput,
    borderRadius:     radius.sm + 1,
    borderWidth:      1,
    borderColor:      colors.border,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical:   7,
  },
  btnEditarText: { fontSize: 15 },

  btnVigencia: {
    borderRadius:     radius.sm + 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical:   7,
  },
  btnBaja: {
    backgroundColor: colors.dangerLight,
    borderWidth:     1,
    borderColor:     colors.dangerBorder,
  },
  btnReactivar: {
    backgroundColor: colors.successLight,
    borderWidth:     1,
    borderColor:     colors.successBorder,
  },
  btnBajaText:      { fontSize: 11, fontWeight: '600', color: colors.danger },
  btnReactivarText: { fontSize: 11, fontWeight: '600', color: colors.success },

  // ── Modal de edición ──────────────────────────────────────────
  modalOverlay: {
    flex:             1,
    justifyContent:   'flex-end',
    backgroundColor:  'rgba(0,0,0,0.35)',
  },
  modalCard: {
    backgroundColor:     colors.bgSurface,
    borderTopLeftRadius:  radius.xl,
    borderTopRightRadius: radius.xl,
    padding:              spacing.xl,
    paddingBottom:        36,
    borderTopWidth:       1,
    borderTopColor:       colors.border,
  },
  modalTitulo: { ...typography.titleLg, marginBottom: spacing.lg },
  modalInput: {
    backgroundColor: colors.bgInput,
    borderRadius:    radius.md,
    padding:         spacing.md - 2,
    color:           colors.textPrimary,
    fontSize:        15,
    borderWidth:     1,
    borderColor:     colors.border,
    marginBottom:    spacing.lg,
  },
  cursosRow:   { flexDirection: 'row', gap: spacing.sm },
  modalAcciones: {
    flexDirection: 'row',
    gap:           spacing.sm + 2,
    marginTop:     spacing.xs,
  },
  btnCancelar: {
    flex:            1,
    paddingVertical: spacing.md,
    borderRadius:    radius.md,
    backgroundColor: colors.bgInput,
    borderWidth:     1,
    borderColor:     colors.border,
    alignItems:      'center',
  },
  btnCancelarText: { color: colors.textSecondary, fontWeight: '600' },
  btnGuardarModal: {
    flex:            2,
    paddingVertical: spacing.md,
    borderRadius:    radius.md,
    backgroundColor: colors.primary,
    alignItems:      'center',
  },
  btnGuardarModalText: { color: colors.primaryText, fontWeight: '700', fontSize: 14 },

  // Vista previa nombre completo en modal
  previewNombre: {
    backgroundColor: '#F0F4FF',
    borderRadius:    8,
    padding:         10,
    marginBottom:    16,
    borderLeftWidth: 3,
    borderLeftColor: '#5B50C8',
  },
  previewLabel: {
    fontSize:   10,
    fontWeight: '600',
    color:      '#5B50C8',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewTexto: {
    fontSize:   14,
    fontWeight: '700',
    color:      '#1A1A2E',
  },
});