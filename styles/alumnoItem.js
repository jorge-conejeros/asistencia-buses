// styles/alumnoItem.js
import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export default StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginVertical: 5,
    marginHorizontal: spacing.md,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    // sombra iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    // sombra Android
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm + 2,
  },
  info:   { flex: 1 },
  nombre: { ...typography.titleMd },
  sub:    { ...typography.caption, marginTop: 2 },

  // Botones presente / ausente
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  btn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.bgInput,
  },
  btnPresenteActive: {
    backgroundColor: colors.successLight,
    borderColor:     colors.success,
  },
  btnAusenteActive: {
    backgroundColor: colors.dangerLight,
    borderColor:     colors.danger,
  },
  btnText: {
    color:      colors.textSecondary,
    fontWeight: '600',
    fontSize:   13,
  },
  btnTextPresenteActive: { color: colors.success },
  btnTextAusenteActive:  { color: colors.danger },

  // Observación
  obsToggle:     { paddingVertical: 4 },
  obsToggleText: {
    color:      colors.primary,
    fontSize:   12,
    fontWeight: '500',
  },
  obsInput: {
    marginTop:        spacing.sm,
    backgroundColor:  colors.bgInput,
    borderRadius:     radius.md,
    padding:          spacing.sm + 2,
    color:            colors.textPrimary,
    fontSize:         13,
    borderWidth:      1,
    borderColor:      colors.border,
    textAlignVertical:'top',
  },
});