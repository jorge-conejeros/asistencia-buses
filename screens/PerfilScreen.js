// screens/PerfilScreen.js
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';
import { Appbar } from 'react-native-paper';
import { common } from '../styles/common';
import { supabase } from '../supabase';
import { colors, radius, spacing, typography } from '../theme';

export default function PerfilScreen({ navigation }) {
  const [perfil, setPerfil]               = useState(null);
  const [cargando, setCargando]           = useState(true);

  // Campos nombre_usuario
  const [nuevoUsuario, setNuevoUsuario]   = useState('');
  const [guardandoUsuario, setGuardandoUsuario] = useState(false);
  const [errorUsuario, setErrorUsuario]   = useState('');
  const [okUsuario, setOkUsuario]         = useState(false);

  // Campos contraseña
  const [passActual, setPassActual]       = useState('');
  const [passNueva, setPassNueva]         = useState('');
  const [passConfirm, setPassConfirm]     = useState('');
  const [guardandoPass, setGuardandoPass] = useState(false);
  const [errorPass, setErrorPass]         = useState('');
  const [okPass, setOkPass]               = useState(false);

  useEffect(() => { cargarPerfil(); }, []);

  // ── Cargar perfil actual ──────────────────────────────────────
  const cargarPerfil = async () => {
    setCargando(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) { setCargando(false); return; }

    const { data, error } = await supabase
      .from('perfiles')
      .select('id, email, nombre_usuario, vigente')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      setPerfil(data);
      setNuevoUsuario(data.nombre_usuario ?? '');
    }
    setCargando(false);
  };

  // ── Verificar disponibilidad de nombre_usuario en tiempo real ─
  const verificarDisponibilidad = async (valor) => {
    setNuevoUsuario(valor);
    setErrorUsuario('');
    setOkUsuario(false);

    if (!valor.trim() || valor.trim() === perfil?.nombre_usuario) return;
    if (valor.trim().length < 3) {
      setErrorUsuario('Mínimo 3 caracteres.');
      return;
    }
    if (/\s/.test(valor)) {
      setErrorUsuario('No puede contener espacios.');
      return;
    }

    // Consultar si ya existe
    const { data } = await supabase
      .from('perfiles')
      .select('id')
      .eq('nombre_usuario', valor.trim())
      .maybeSingle();

    if (data) {
      setErrorUsuario('Ese nombre de usuario ya está en uso.');
    } else {
      setOkUsuario(true);
    }
  };

  // ── Guardar nombre_usuario ────────────────────────────────────
  const guardarUsuario = async () => {
    if (errorUsuario) return;
    if (!nuevoUsuario.trim()) {
      setErrorUsuario('El nombre de usuario no puede estar vacío.');
      return;
    }
    if (nuevoUsuario.trim() === perfil?.nombre_usuario) {
      setErrorUsuario('Es el mismo nombre de usuario actual.');
      return;
    }

    setGuardandoUsuario(true);
    const { error } = await supabase
      .from('perfiles')
      .update({ nombre_usuario: nuevoUsuario.trim() })
      .eq('id', perfil.id);

    setGuardandoUsuario(false);

    if (error) {
      if (error.code === '23505') {
        setErrorUsuario('Ese nombre de usuario ya está en uso.');
      } else {
        setErrorUsuario('Error al guardar. Intenta de nuevo.');
      }
    } else {
      setPerfil((prev) => ({ ...prev, nombre_usuario: nuevoUsuario.trim() }));
      Alert.alert('✓ Listo', 'Nombre de usuario actualizado correctamente.');
    }
  };

  // ── Guardar contraseña ────────────────────────────────────────
  const guardarPassword = async () => {
    setErrorPass('');
    setOkPass(false);

    if (!passActual.trim())  { setErrorPass('Ingresa tu contraseña actual.'); return; }
    if (!passNueva.trim())   { setErrorPass('Ingresa la nueva contraseña.'); return; }
    if (passNueva.length < 6) { setErrorPass('La contraseña debe tener al menos 6 caracteres.'); return; }
    if (passNueva !== passConfirm) { setErrorPass('Las contraseñas nuevas no coinciden.'); return; }
    if (passActual === passNueva)  { setErrorPass('La nueva contraseña debe ser diferente.'); return; }

    setGuardandoPass(true);

    // Verificar contraseña actual reautenticando
    const { error: reAuthError } = await supabase.auth.signInWithPassword({
      email:    perfil.email,
      password: passActual.trim(),
    });

    if (reAuthError) {
      setGuardandoPass(false);
      setErrorPass('Contraseña actual incorrecta.');
      return;
    }

    // Actualizar contraseña
    const { error: updateError } = await supabase.auth.updateUser({
      password: passNueva.trim(),
    });

    setGuardandoPass(false);

    if (updateError) {
      setErrorPass('Error al cambiar la contraseña. Intenta de nuevo.');
    } else {
      setOkPass(true);
      setPassActual('');
      setPassNueva('');
      setPassConfirm('');
      Alert.alert('✓ Listo', 'Contraseña actualizada correctamente.');
    }
  };

  if (cargando) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bgBase }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Appbar.Header style={common.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={colors.primary} />
        <Appbar.Content title="Mi perfil" titleStyle={common.appbarTitle} />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Info actual */}
        <View style={s.infoCard}>
          <Text style={s.infoLabel}>Cuenta</Text>
          <Text style={s.infoEmail}>{perfil?.email}</Text>
          <Text style={s.infoUsuario}>
            @{perfil?.nombre_usuario ?? 'sin nombre de usuario'}
          </Text>
        </View>

        {/* ── Sección: nombre_usuario ── */}
        <View style={s.seccion}>
          <Text style={s.seccionTitulo}>Nombre de usuario</Text>
          <Text style={s.seccionDesc}>
            Con este nombre podrás iniciar sesión en vez de tu correo.
          </Text>

          <Text style={s.label}>Nuevo nombre de usuario</Text>
          <View style={s.inputRow}>
            <Text style={s.inputPrefix}>@</Text>
            <TextInput
              style={[s.inputConPrefijo, errorUsuario && s.inputError, okUsuario && s.inputOk]}
              value={nuevoUsuario}
              onChangeText={verificarDisponibilidad}
              placeholder="ej: prof.garcia"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {errorUsuario ? (
            <Text style={s.errorTexto}>⚠ {errorUsuario}</Text>
          ) : okUsuario ? (
            <Text style={s.okTexto}>✓ Nombre de usuario disponible</Text>
          ) : null}

          <TouchableOpacity
            style={[s.btnGuardar, (guardandoUsuario || !!errorUsuario) && s.btnDisabled]}
            onPress={guardarUsuario}
            disabled={guardandoUsuario || !!errorUsuario}
          >
            {guardandoUsuario
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={s.btnGuardarText}>Guardar nombre de usuario</Text>
            }
          </TouchableOpacity>
        </View>

        {/* ── Sección: contraseña ── */}
        <View style={s.seccion}>
          <Text style={s.seccionTitulo}>Cambiar contraseña</Text>
          <Text style={s.seccionDesc}>
            Ingresa tu contraseña actual para confirmar el cambio.
          </Text>

          <Text style={s.label}>Contraseña actual</Text>
          <TextInput
            style={[s.input, errorPass && s.inputError]}
            value={passActual}
            onChangeText={(t) => { setPassActual(t); setErrorPass(''); }}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />

          <Text style={s.label}>Nueva contraseña</Text>
          <TextInput
            style={[s.input, errorPass && s.inputError]}
            value={passNueva}
            onChangeText={(t) => { setPassNueva(t); setErrorPass(''); }}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />

          <Text style={s.label}>Confirmar nueva contraseña</Text>
          <TextInput
            style={[s.input, errorPass && s.inputError]}
            value={passConfirm}
            onChangeText={(t) => { setPassConfirm(t); setErrorPass(''); }}
            placeholder="Repite la nueva contraseña"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />

          {errorPass ? (
            <Text style={s.errorTexto}>⚠ {errorPass}</Text>
          ) : okPass ? (
            <Text style={s.okTexto}>✓ Contraseña actualizada</Text>
          ) : null}

          <TouchableOpacity
            style={[s.btnGuardar, guardandoPass && s.btnDisabled]}
            onPress={guardarPassword}
            disabled={guardandoPass}
          >
            {guardandoPass
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={s.btnGuardarText}>Cambiar contraseña</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgBase },
  scroll:   { padding: spacing.md, paddingBottom: 60 },

  // Info card
  infoCard: {
    backgroundColor: colors.primaryLight,
    borderRadius:    radius.lg,
    padding:         spacing.lg,
    marginBottom:    spacing.lg,
    borderWidth:     1,
    borderColor:     colors.border,
  },
  infoLabel:   { ...typography.label, color: colors.primary, marginBottom: spacing.xs },
  infoEmail:   { ...typography.titleSm, color: colors.textPrimary },
  infoUsuario: { ...typography.caption, color: colors.primary, marginTop: 2, fontWeight: '600' },

  // Secciones
  seccion: {
    backgroundColor: colors.bgSurface,
    borderRadius:    radius.lg,
    padding:         spacing.lg,
    marginBottom:    spacing.md,
    borderWidth:     1,
    borderColor:     colors.border,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.05,
    shadowRadius:    3,
    elevation:       2,
  },
  seccionTitulo: { ...typography.titleMd, marginBottom: spacing.xs },
  seccionDesc:   { ...typography.caption, marginBottom: spacing.md },

  // Labels e inputs
  label: {
    fontSize:      12,
    fontWeight:    '600',
    color:         colors.textSecondary,
    marginBottom:  spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor:   colors.bgInput,
    borderRadius:      radius.md,
    borderWidth:       1.5,
    borderColor:       colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm + 2,
    fontSize:          14,
    color:             colors.textPrimary,
    marginBottom:      spacing.md,
  },
  inputRow: {
    flexDirection:  'row',
    alignItems:     'center',
    backgroundColor: colors.bgInput,
    borderRadius:   radius.md,
    borderWidth:    1.5,
    borderColor:    colors.border,
    marginBottom:   spacing.sm,
    overflow:       'hidden',
  },
  inputPrefix: {
    paddingHorizontal: spacing.md,
    fontSize:          16,
    color:             colors.primary,
    fontWeight:        '700',
  },
  inputConPrefijo: {
    flex:            1,
    paddingVertical: spacing.sm + 2,
    paddingRight:    spacing.md,
    fontSize:        14,
    color:           colors.textPrimary,
  },
  inputError: { borderColor: colors.danger },
  inputOk:    { borderColor: colors.success },

  // Mensajes
  errorTexto: {
    color:        colors.danger,
    fontSize:     12,
    fontWeight:   '500',
    marginBottom: spacing.md,
  },
  okTexto: {
    color:        colors.success,
    fontSize:     12,
    fontWeight:   '600',
    marginBottom: spacing.md,
  },

  // Botón guardar
  btnGuardar: {
    backgroundColor: colors.primary,
    borderRadius:    radius.md,
    paddingVertical: spacing.md,
    alignItems:      'center',
    marginTop:       spacing.xs,
    shadowColor:     colors.primary,
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.2,
    shadowRadius:    4,
    elevation:       3,
  },
  btnDisabled:    { opacity: 0.5 },
  btnGuardarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});