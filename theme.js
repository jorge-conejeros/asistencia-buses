// theme.js
// ─────────────────────────────────────────────────────────────
// Paleta clara y elegante. Todos los archivos de estilos
// importan desde aquí. Para cambiar el look de la app,
// edita solo este archivo.
// ─────────────────────────────────────────────────────────────

export const colors = {
  // Fondos
  bgBase:        '#F4F6FB',   // fondo principal (blanco azulado suave)
  bgSurface:     '#FFFFFF',   // tarjetas y superficies
  bgElevated:    '#EDF0F7',   // superficies elevadas / appbar
  bgInput:       '#F0F2F9',   // campos de texto

  // Bordes
  border:        '#DDE1EF',
  borderFocus:   '#7C6FCD',

  // Marca / acento principal (violeta refinado)
  primary:       '#5B50C8',
  primaryLight:  '#EAE8F8',
  primaryText:   '#FFFFFF',

  // Texto
  textPrimary:   '#1A1A2E',   // títulos y contenido principal
  textSecondary: '#6B7280',   // subtítulos y metadatos
  textMuted:     '#A0A6B8',   // placeholders
  textOnDark:    '#FFFFFF',

  // Estado: presente
  success:       '#16A34A',
  successLight:  '#DCFCE7',
  successBorder: '#86EFAC',

  // Estado: ausente
  danger:        '#DC2626',
  dangerLight:   '#FEE2E2',
  dangerBorder:  '#FCA5A5',

  // Advertencia / sin marcar
  warning:       '#D97706',
  warningLight:  '#FEF3C7',
  warningBorder: '#FCD34D',

  // Badges de curso
  badge:         '#EAE8F8',
  badgeText:     '#5B50C8',

  // Inactivo / baja
  inactive:      '#F3F4F6',
  inactiveText:  '#9CA3AF',
  inactiveLine:  '#D1D5DB',
};

export const radius = {
  sm:  6,
  md:  10,
  lg:  14,
  xl:  20,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const typography = {
  titleLg:  { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  titleMd:  { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  titleSm:  { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  body:     { fontSize: 14, fontWeight: '400', color: colors.textPrimary },
  caption:  { fontSize: 12, fontWeight: '400', color: colors.textSecondary },
  label:    { fontSize: 11, fontWeight: '600', color: colors.textSecondary,
              textTransform: 'uppercase', letterSpacing: 0.5 },
  muted:    { fontSize: 12, fontWeight: '400', color: colors.textMuted },
};

// Tema para React Native Paper (MD3)
export const paperTheme = {
  colors: {
    primary:    colors.primary,
    secondary:  colors.primaryLight,
    background: colors.bgBase,
    surface:    colors.bgSurface,
    onSurface:  colors.textPrimary,
    onPrimary:  colors.primaryText,
    outline:    colors.border,
  },
};