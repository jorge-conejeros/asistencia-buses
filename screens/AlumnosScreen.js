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

export default function AlumnosScreen({ navigation }) {
  const [alumnos, setAlumnos]           = useState([]);
  const [busqueda, setBusqueda]         = useState('');
  const [cargando, setCargando]         = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [alumnoEditar, setAlumnoEditar] = useState(null);
  const [formNombre, setFormNombre]     = useState('');
  const [formCurso, setFormCurso]       = useState('');
  const [guardando, setGuardando]       = useState(false);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  useEffect(() => { cargarAlumnos(); }, []);

  // ── Carga ──────────────────────────────────────────────────────
  const cargarAlumnos = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('alumnos')
      .select('id, nombre, curso, vigente')
      .order('vigente', { ascending: false })
      .order('curso')
      .order('nombre');
    if (error) { Alert.alert('Error', 'No se pudieron cargar los alumnos.'); }
    else       { setAlumnos(data); }
    setCargando(false);
  };

  // ── Filtro ─────────────────────────────────────────────────────
  const alumnosFiltrados = useCallback((soloVigentes) => {
    return alumnos.filter((a) => {
      const porVigencia = soloVigentes ? a.vigente === true : a.vigente === false;
      const porNombre   = a.nombre.toLowerCase().includes(busqueda.toLowerCase());
      return porVigencia && porNombre;
    });
  }, [alumnos, busqueda]);

  // ── Modal edición ──────────────────────────────────────────────
  const abrirEditar = (alumno) => {
    setAlumnoEditar(alumno);
    setFormNombre(alumno.nombre);
    setFormCurso(alumno.curso);
    setModalVisible(true);
  };
  const cerrarModal = () => { setModalVisible(false); setAlumnoEditar(null); };

  // ── Obtener userId ─────────────────────────────────────────────
  const obtenerUserId = async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id ?? null;
  };

  // ── Guardar nombre + curso ─────────────────────────────────────
  const guardarCambios = async () => {
    if (!formNombre.trim()) { Alert.alert('Campo requerido', 'El nombre no puede estar vacío.'); return; }
    if (!formCurso)         { Alert.alert('Campo requerido', 'Debes seleccionar un curso.'); return; }

    setGuardando(true);
    const userId = await obtenerUserId();

    const { error } = await supabase
      .from('alumnos')
      .update({
        nombre:      formNombre.trim(),
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
        prev.map((a) =>
          a.id === alumnoEditar.id ? { ...a, nombre: formNombre.trim(), curso: formCurso } : a
        )
      );
      cerrarModal();
    }
  };

  // ── Cambiar vigencia ───────────────────────────────────────────
  const cambiarVigencia = (alumno) => {
    const esBaja    = alumno.vigente;
    const titulo    = esBaja ? 'Volver inactivo' : '¿Reactivar alumno?';
    const mensaje   = esBaja
      ? `¿Estás seguro de que deseas marcar como inactivo a ${alumno.nombre}?\n\nYa no aparecerá en el registro de asistencia diario.`
      : `¿Deseas reactivar a ${alumno.nombre}?\n\nVolverá a aparecer en el registro de asistencia.`;

    Alert.alert(titulo, mensaje, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text:  esBaja ? 'Sí, volver inactivo' : 'Sí, reactivar',
        style: esBaja ? 'destructive' : 'default',
        onPress: () => ejecutarCambioVigencia(alumno),
      },
    ]);
  };

  const ejecutarCambioVigencia = async (alumno) => {
    const userId = await obtenerUserId();
    const { error } = await supabase
      .from('alumnos')
      .update({
        vigente:     !alumno.vigente,
        editado_por: userId,
        editado_en:  new Date().toISOString(),
      })
      .eq('id', alumno.id);

    if (error) {
      Alert.alert('Error', 'No se pudo actualizar la vigencia.');
    } else {
      setAlumnos((prev) =>
        prev.map((a) => a.id === alumno.id ? { ...a, vigente: !a.vigente } : a)
      );
    }
  };

  // ── Render fila ────────────────────────────────────────────────
  const renderAlumno = (item) => (
    <View key={item.id} style={[s.fila, !item.vigente && s.filaInactiva]}>
      {/* Info: ocupa el espacio disponible pero no bloquea los botones */}
      <View style={s.filaInfo} pointerEvents="none">
        <Text style={[s.filaNombre, !item.vigente && s.filaNombreInactivo]}>
          {item.nombre}
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

      {/* Acciones: zona de toques explícita */}
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
        placeholder="Buscar alumno..."
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
          {/* ── Alumnos activos ── */}
          <View style={common.sectionHeader}>
            <Text style={common.sectionTitle}>ALUMNOS ACTIVOS ({vigentes.length})</Text>
          </View>
          {vigentes.length === 0
            ? <Text style={common.emptyText}>Sin resultados.</Text>
            : vigentes.map(renderAlumno)}

          {/* ── Alumnos inactivos (colapsable) ── */}
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

      {/* Modal edición */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={cerrarModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={s.modalOverlay}
        >
          <View style={s.modalCard}>
            <Text style={s.modalTitulo}>Editar alumno</Text>

            <Text style={common.sectionTitle}>NOMBRE COMPLETO</Text>
            <TextInput
              style={s.modalInput}
              value={formNombre}
              onChangeText={setFormNombre}
              placeholder="Nombre del alumno"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
            />

            <Text style={[common.sectionTitle, { marginBottom: 10 }]}>CURSO</Text>
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