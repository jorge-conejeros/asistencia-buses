// styles/common.js
// Estilos reutilizables compartidos entre pantallas y componentes.
import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export const common = StyleSheet.create({
  // ── Layout ────────────────────────────────────────────────────
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // ── Appbar ────────────────────────────────────────────────────
  appbar: {
    backgroundColor: colors.bgElevated,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  appbarTitle: {
    ...typography.titleMd,
    color: colors.textPrimary,
  },

  // ── Searchbar ─────────────────────────────────────────────────
  searchbar: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    elevation: 0,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // ── Chips de filtro ───────────────────────────────────────────
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderRadius: radius.pill,
    backgroundColor: colors.bgSurface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.titleSm,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.primaryText,
  },

  // ── Badges ────────────────────────────────────────────────────
  badge: {
    backgroundColor: colors.badge,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeText: {
    ...typography.label,
    color: colors.badgeText,
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Botones ───────────────────────────────────────────────────
  btnPrimary: {
    flex: 1,
    paddingVertical: spacing.md - 2,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: colors.primaryText,
    fontWeight: '700',
    fontSize: 13,
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: spacing.md - 2,
    borderRadius: radius.md,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },

  // ── Barra inferior fija ───────────────────────────────────────
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    backgroundColor: colors.bgElevated,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  // ── Mensajes vacíos ───────────────────────────────────────────
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 60,
    fontSize: 14,
  },

  // ── Secciones con header ──────────────────────────────────────
  sectionHeader: {
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.primary,
  },
});