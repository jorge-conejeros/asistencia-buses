// screens/AlumnosScreen.js
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView, Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Appbar, Searchbar } from 'react-native-paper';
import s from '../styles/alumnos';
import { common } from '../styles/common';
import { supabase } from '../supabase';
import { colors } from '../theme';

const CURSOS = ['1° Medio', '2° Medio', '3° Medio', '4° Medio'];

// Orden lógico de cursos para mostrar agrupados
const ORDEN_CURSOS = ['1° Medio', '2° Medio', '3° Medio', '4° Medio'];

export default function AlumnosScreen({ navigation }) {
  const [alumnos, setAlumnos]           = useState([]);
  const [busqueda, setBusqueda]         = useState('');
  const [cargando, setCargando]         = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [alumnoEditar, setAlumnoEditar] = useState(null);
  const [guardando, setGuardando]       = useState(false);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  // Campos del formulario separados
  const [formNombres, setFormNombres]           = useState('');
  const [formApellidoPat, setFormApellidoPat]   = useState('');
  const [formApellidoMat, setFormApellidoMat]   = useState('');
  const [formCurso, setFormCurso]               = useState('');

  useEffect(() => { cargarAlumnos(); }, []);

  // ── Carga — ordenado por curso → apellido_paterno → nombres ───
  const cargarAlumnos = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('alumnos')
      .select('id, nombres, apellido_paterno, apellido_materno, nombre_completo, curso, vigente')
      .order('vigente', { ascending: false })
      .order('curso')
      .order('apellido_paterno')
      .order('nombres');

    if (error) { Alert.alert('Error', 'No se pudieron cargar los alumnos.'); }
    else       { setAlumnos(data); }
    setCargando(false);
  };

  // ── Filtro — busca en apellidos y nombres ─────────────────────
  const alumnosFiltrados = useCallback((soloVigentes) => {
    const q = busqueda.toLowerCase();
    return alumnos.filter((a) => {
      const porVigencia = soloVigentes ? a.vigente === true : a.vigente === false;
      const porNombre   = !q
        || a.apellido_paterno?.toLowerCase().includes(q)
        || a.apellido_materno?.toLowerCase().includes(q)
        || a.nombres?.toLowerCase().includes(q);
      return porVigencia && porNombre;
    });
  }, [alumnos, busqueda]);

  // ── Nombre para mostrar en UI ─────────────────────────────────
  const nombreMostrar = (a) =>
    a.nombre_completo
    ?? `${a.apellido_paterno?.toUpperCase() ?? ''} ${a.apellido_materno?.toUpperCase() ?? ''}, ${a.nombres ?? ''}`.trim();

  // ── Modal edición ──────────────────────────────────────────────
  const abrirEditar = (alumno) => {
    setAlumnoEditar(alumno);
    setFormNombres(alumno.nombres ?? '');
    setFormApellidoPat(alumno.apellido_paterno ?? '');
    setFormApellidoMat(alumno.apellido_materno ?? '');
    setFormCurso(alumno.curso ?? '');
    setModalVisible(true);
  };
  const cerrarModal = () => { setModalVisible(false); setAlumnoEditar(null); };

  const obtenerUserId = async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id ?? null;
  };

  // ── Guardar cambios ────────────────────────────────────────────
  const guardarCambios = async () => {
    if (!formNombres.trim())     { Alert.alert('Campo requerido', 'Ingresa el o los nombres.'); return; }
    if (!formApellidoPat.trim()) { Alert.alert('Campo requerido', 'Ingresa el apellido paterno.'); return; }
    if (!formCurso)              { Alert.alert('Campo requerido', 'Selecciona un curso.'); return; }

    setGuardando(true);
    const userId = await obtenerUserId();

    const { error } = await supabase
      .from('alumnos')
      .update({
        nombres:          formNombres.trim(),
        apellido_paterno: formApellidoPat.trim(),
        apellido_materno: formApellidoMat.trim() || null,
        // Mantener columna nombre sincronizada
        nombre: `${formNombres.trim()} ${formApellidoPat.trim()}${formApellidoMat.trim() ? ' ' + formApellidoMat.trim() : ''}`,
        curso:       formCurso,
        editado_por: userId,
        editado_en:  new Date().toISOString(),
      })
      .eq('id', alumnoEditar.id);

    setGuardando(false);

    if (error) {
      Alert.alert('Error', 'No se pudo guardar. Intenta de nuevo.');
    } else {
      setAlumnos((prev) =>
        prev.map((a) => a.id === alumnoEditar.id ? {
          ...a,
          nombres:          formNombres.trim(),
          apellido_paterno: formApellidoPat.trim(),
          apellido_materno: formApellidoMat.trim() || null,
          curso:            formCurso,
        } : a)
      );
      cerrarModal();
    }
  };

  // ── Vigencia ───────────────────────────────────────────────────
  const cambiarVigencia = (alumno) => {
    const esBaja  = alumno.vigente;
    const display = nombreMostrar(alumno);
    Alert.alert(
      esBaja ? 'Volver inactivo' : '¿Reactivar alumno?',
      esBaja
        ? `¿Marcar como inactivo a ${display}?\n\nYa no aparecerá en el registro de asistencia.`
        : `¿Reactivar a ${display}?\n\nVolverá a aparecer en el registro de asistencia.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: esBaja ? 'Sí, volver inactivo' : 'Sí, reactivar',
          style: esBaja ? 'destructive' : 'default',
          onPress: () => ejecutarCambioVigencia(alumno) },
      ]
    );
  };

  const ejecutarCambioVigencia = async (alumno) => {
    const userId = await obtenerUserId();
    const { error } = await supabase
      .from('alumnos')
      .update({ vigente: !alumno.vigente, editado_por: userId, editado_en: new Date().toISOString() })
      .eq('id', alumno.id);

    if (error) { Alert.alert('Error', 'No se pudo actualizar la vigencia.'); return; }
    setAlumnos((prev) =>
      prev.map((a) => a.id === alumno.id ? { ...a, vigente: !a.vigente } : a)
    );
  };

  // ── Render fila ────────────────────────────────────────────────
  const renderAlumno = (item) => (
    <View key={item.id} style={[s.fila, !item.vigente && s.filaInactiva]}>
      <View style={s.filaInfo} pointerEvents="none">
        <Text style={[s.filaNombre, !item.vigente && s.filaNombreInactivo]} numberOfLines={1}>
          {nombreMostrar(item)}
        </Text>
        <View style={s.filaCursoRow}>
          <View style={common.badge}>
            <Text style={common.badgeText}>{item.curso}</Text>
          </View>
          {!item.vigente && (
            <View style={s.bajaBadge}>
              <Text style={s.bajaBadgeText}>Inactivo</Text>
            </View>
          )}
        </View>
      </View>

      <View style={s.filaAcciones}>
        <TouchableOpacity
          style={s.btnEditar}
          onPress={() => abrirEditar(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={s.btnEditarText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.btnVigencia, item.vigente ? s.btnBaja : s.btnReactivar]}
          onPress={() => cambiarVigencia(item)}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Text style={item.vigente ? s.btnBajaText : s.btnReactivarText}>
            {item.vigente ? 'Volver inactivo' : 'Reactivar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const vigentes  = alumnosFiltrados(true);
  const inactivos = alumnosFiltrados(false);

  return (
    <View style={common.screen}>
      <Appbar.Header style={common.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={colors.primary} />
        <Appbar.Content title="Gestión de alumnos" titleStyle={common.appbarTitle} />
        <Appbar.Action icon="refresh" onPress={cargarAlumnos} color={colors.primary} />
      </Appbar.Header>

      <Searchbar
        placeholder="Buscar por nombre o apellido..."
        value={busqueda}
        onChangeText={setBusqueda}
        style={common.searchbar}
        inputStyle={{ color: colors.textPrimary }}
        iconColor={colors.primary}
        placeholderTextColor={colors.textMuted}
      />

      {cargando ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={colors.primary} size="large" />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={common.sectionHeader}>
            <Text style={common.sectionTitle}>ALUMNOS ACTIVOS ({vigentes.length})</Text>
          </View>
          {vigentes.length === 0
            ? <Text style={common.emptyText}>Sin resultados.</Text>
            : vigentes.map(renderAlumno)}

          <TouchableOpacity
            style={s.seccionHeaderToggle}
            onPress={() => setMostrarInactivos(!mostrarInactivos)}
          >
            <Text style={s.seccionTituloToggle}>
              {mostrarInactivos ? '▲' : '▼'} Alumnos inactivos ({inactivos.length})
            </Text>
          </TouchableOpacity>

          {mostrarInactivos && (
            inactivos.length === 0
              ? <Text style={common.emptyText}>Sin alumnos inactivos.</Text>
              : inactivos.map(renderAlumno)
          )}
        </ScrollView>
      )}

      {/* ── Modal edición ── */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={cerrarModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={s.modalOverlay}
        >
          <View style={s.modalCard}>
            <Text style={s.modalTitulo}>Editar alumno</Text>

            {/* Apellido paterno */}
            <Text style={common.sectionTitle}>APELLIDO PATERNO *</Text>
            <TextInput
              style={s.modalInput}
              value={formApellidoPat}
              onChangeText={setFormApellidoPat}
              placeholder="ej: Pérez"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
            />

            {/* Apellido materno */}
            <Text style={common.sectionTitle}>APELLIDO MATERNO</Text>
            <TextInput
              style={s.modalInput}
              value={formApellidoMat}
              onChangeText={setFormApellidoMat}
              placeholder="ej: García (opcional)"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
            />

            {/* Nombres */}
            <Text style={common.sectionTitle}>NOMBRES *</Text>
            <TextInput
              style={s.modalInput}
              value={formNombres}
              onChangeText={setFormNombres}
              placeholder="ej: Juan Carlos"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
            />

            {/* Curso */}
            <Text style={[common.sectionTitle, { marginBottom: 10 }]}>CURSO *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              <View style={s.cursosRow}>
                {CURSOS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[common.chip, formCurso === c && common.chipActive]}
                    onPress={() => setFormCurso(c)}
                  >
                    <Text style={[common.chipText, formCurso === c && common.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Vista previa nombre completo */}
            {(formApellidoPat || formNombres) && (
              <View style={s.previewNombre}>
                <Text style={s.previewLabel}>Vista previa</Text>
                <Text style={s.previewTexto}>
                  {formApellidoPat.toUpperCase()}{formApellidoMat ? ' ' + formApellidoMat.toUpperCase() : ''}, {formNombres}
                </Text>
              </View>
            )}

            <View style={s.modalAcciones}>
              <TouchableOpacity style={s.btnCancelar} onPress={cerrarModal}>
                <Text style={s.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btnGuardarModal, guardando && { opacity: 0.6 }]}
                onPress={guardarCambios}
                disabled={guardando}
              >
                <Text style={s.btnGuardarModalText}>
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}