// screens/LoginScreen.js
import { useState } from 'react';
import {
  ActivityIndicator, Image,
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../supabase';
import { colors, radius, spacing, typography } from '../theme';

// Logo institucional — ruta fija, Metro la resuelve en tiempo de compilación
const LOGO = require('../assets/images/logoelvergel.png');

/**
 * Pantalla de login.
 * Logo: coloca tu archivo en /assets/logo.png y descomenta la línea de Image.
 * Con navegación condicional en App.js no se necesita navegar manualmente
 * tras el login — React Navigation lo hace automático al detectar la sesión.
 */
/**
 * Muestra el logo institucional.
 * Si el archivo no carga, muestra un fallback con emoji y mensaje de error
 * en desarrollo para que sea fácil de detectar.
 */
function LogoInstitucional() {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <View style={s.logoError}>
        <Text style={s.logoErrorEmoji}>🏫</Text>
        <Text style={s.logoErrorTexto}>Logo no encontrado{''}assets/images/logoelvergel.png</Text>
      </View>
    );
  }

  return (
    <Image
      source={LOGO}
      style={s.logo}
      resizeMode="contain"
      onError={() => setImgError(true)}
    />
  );
}

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async () => {
    setError('');

    if (!email.trim())    { setError('Ingresa tu usuario o correo.'); return; }
    if (!password.trim()) { setError('Ingresa tu contraseña.'); return; }

    setCargando(true);

    // Paso 1: buscar perfil por nombre_usuario (login con alias)
    // Si no encuentra, intentar login directo con email
    let emailFinal = email.trim().toLowerCase();

    const { data: perfilData } = await supabase
      .from('perfiles')
      .select('id, email, nombre_usuario, vigente')
      .eq('nombre_usuario', email.trim())
      .maybeSingle();

    if (perfilData) {
      // Encontró perfil por nombre_usuario
      if (!perfilData.vigente) {
        setCargando(false);
        setError('Usuario inhabilitado para ingresar al sistema.');
        return;
      }
      emailFinal = perfilData.email;
    }

    // Paso 2: autenticar con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email:    emailFinal,
      password: password.trim(),
    });
    setCargando(false);

    if (authError) {
      setError('Usuario o contraseña incorrectos. Intenta de nuevo.');
      return;
    }

    // Paso 3: si logró autenticar pero no buscamos perfil antes, verificar vigencia ahora
    if (!perfilData && authData?.user) {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('vigente')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (perfil && !perfil.vigente) {
        // Forzar cierre de sesión inmediato
        await supabase.auth.signOut();
        setError('Usuario inhabilitado para ingresar al sistema.');
        return;
      }
    }
    // App.js detecta la sesión y navega automáticamente
  };

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cabecera con logo ── */}
        <View style={s.header}>
          <LogoInstitucional />
          <Text style={s.titulo}>Sistema de Asistencia</Text>
          <Text style={s.subtitulo}>Buses de Acercamiento Escolar</Text>
        </View>

        {/* ── Formulario ── */}
        <View style={s.card}>
          <Text style={s.cardTitulo}>Iniciar sesión</Text>
          <Text style={s.cardSubtitulo}>Ingresa con tu usuario o correo institucional</Text>

          {/* Correo */}
          <Text style={s.label}>Correo electrónico</Text>
          <TextInput
            style={[s.input, error && s.inputError]}
            value={email}
            onChangeText={(t) => { setEmail(t); setError(''); }}
            placeholder="usuario o correo@institucion.cl"
            placeholderTextColor={colors.textMuted}
            keyboardType="default"
            autoCapitalize="none"  // nombre_usuario es case-sensitive
            autoCorrect={false}
          />

          {/* Contraseña */}
          <Text style={s.label}>Contraseña</Text>
          <TextInput
            style={[s.input, error && s.inputError]}
            value={password}
            onChangeText={(t) => { setPassword(t); setError(''); }}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />

          {/* Error */}
          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>⚠ {error}</Text>
            </View>
          ) : null}

          {/* Botón */}
          <TouchableOpacity
            style={[s.btnLogin, cargando && s.btnLoginDisabled]}
            onPress={handleLogin}
            disabled={cargando}
            activeOpacity={0.85}
          >
            {cargando
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={s.btnLoginText}>Ingresar</Text>
            }
          </TouchableOpacity>
        </View>

        {/* ── Pie ── */}
        <Text style={s.pie}>Sistema de gestión de asistencia escolar</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex:   { flex: 1, backgroundColor: colors.bgBase },
  scroll: {
    flexGrow:        1,
    justifyContent:  'center',
    paddingHorizontal: spacing.xl,
    paddingVertical:   spacing.xl * 2,
  },

  // Cabecera
  header: {
    alignItems:   'center',
    marginBottom: spacing.xl + 4,
  },
  logo: {
    width:        140,
    height:       140,
    marginBottom: spacing.lg,
  },
  // Fallback cuando el logo falla al cargar
  logoError: {
    width:           140,
    height:          140,
    borderRadius:    radius.xl,
    backgroundColor: colors.dangerLight,
    borderWidth:     1,
    borderColor:     colors.dangerBorder,
    justifyContent:  'center',
    alignItems:      'center',
    marginBottom:    spacing.lg,
    padding:         spacing.sm,
  },
  logoErrorEmoji: { fontSize: 36, marginBottom: 4 },
  logoErrorTexto: {
    fontSize:   9,
    color:      colors.danger,
    textAlign:  'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  titulo: {
    ...typography.titleLg,
    fontSize:     22,
    color:        colors.primary,
    textAlign:    'center',
    marginBottom: spacing.xs,
  },
  subtitulo: {
    ...typography.caption,
    textAlign: 'center',
    color:     colors.textSecondary,
  },

  // Card del formulario
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius:    radius.xl,
    padding:         spacing.xl,
    borderWidth:     1,
    borderColor:     colors.border,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.07,
    shadowRadius:    8,
    elevation:       3,
  },
  cardTitulo: {
    ...typography.titleLg,
    marginBottom: spacing.xs,
  },
  cardSubtitulo: {
    ...typography.caption,
    marginBottom: spacing.lg + 4,
  },

  // Campos
  label: {
    fontSize:     12,
    fontWeight:   '600',
    color:        colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform:'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.bgInput,
    borderRadius:    radius.md,
    borderWidth:     1.5,
    borderColor:     colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.md - 1,
    fontSize:        15,
    color:           colors.textPrimary,
    marginBottom:    spacing.md,
  },
  inputError: {
    borderColor: colors.danger,
  },

  // Error
  errorBox: {
    backgroundColor: colors.dangerLight,
    borderRadius:    radius.md,
    borderWidth:     1,
    borderColor:     colors.dangerBorder,
    padding:         spacing.sm + 2,
    marginBottom:    spacing.md,
  },
  errorText: {
    color:    colors.danger,
    fontSize: 13,
    fontWeight: '500',
  },

  // Botón
  btnLogin: {
    backgroundColor: colors.primary,
    borderRadius:    radius.md,
    paddingVertical: spacing.md,
    alignItems:      'center',
    marginTop:       spacing.xs,
    shadowColor:     colors.primary,
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.25,
    shadowRadius:    6,
    elevation:       4,
  },
  btnLoginDisabled: { opacity: 0.65 },
  btnLoginText: {
    color:      '#fff',
    fontWeight: '700',
    fontSize:   15,
    letterSpacing: 0.3,
  },

  // Pie
  pie: {
    ...typography.muted,
    textAlign:  'center',
    marginTop:  spacing.xl,
    fontSize:   11,
  },
});