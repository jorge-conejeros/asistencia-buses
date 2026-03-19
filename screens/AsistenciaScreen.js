// screens/AsistenciaScreen.js
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Appbar, Searchbar } from 'react-native-paper';
import AlumnoItem from '../components/AlumnoItem';
import { supabase } from '../supabase';

/**
 * Pantalla principal de registro de asistencia.
 * - Carga alumnos desde Supabase
 * - Permite filtrar por ruta y buscar por nombre
 * - Maneja estado local de asistencia
 * - Guarda en tabla `asistencia` al presionar "Guardar"
 */
export default function AsistenciaScreen({ navigation }) {
  const [alumnos, setAlumnos] = useState([]);
  const [estados, setEstados] = useState({});       // { [alumno_id]: { presente, observacion } }
  const [rutaFiltro, setRutaFiltro] = useState('Todas');
  const [rutas, setRutas] = useState(['Todas']);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [usuario, setUsuario] = useState(null);

  // ── Cargar usuario y alumnos al montar ──────────────────────────────────
  useEffect(() => {
    obtenerUsuario();
    cargarAlumnos();
  }, []);

  const obtenerUsuario = async () => {
    const { data } = await supabase.auth.getUser();
    setUsuario(data?.user ?? null);
  };

  const cargarAlumnos = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('alumnos')
      .select('id, nombre, curso, ruta')
      .order('ruta')
      .order('nombre');

    if (error) {
      Alert.alert('Error', 'No se pudieron cargar los alumnos.');
      setCargando(false);
      return;
    }

    setAlumnos(data);
    inicializarEstados(data);
    extraerRutas(data);
    setCargando(false);
  };

  const inicializarEstados = (lista) => {
    const inicial = {};
    lista.forEach((a) => {
      inicial[a.id] = { presente: null, observacion: '' };
    });
    setEstados(inicial);
  };

  const extraerRutas = (lista) => {
    const unicas = ['Todas', ...new Set(lista.map((a) => a.ruta))];
    setRutas(unicas);
  };

  // ── Cambio de estado individual ─────────────────────────────────────────
  const handleCambio = useCallback((alumnoId, nuevoEstado) => {
    setEstados((prev) => ({ ...prev, [alumnoId]: nuevoEstado }));
  }, []);

  // ── Marcar todos ─────────────────────────────────────────────────────────
  const marcarTodos = (valor) => {
    setEstados((prev) => {
      const nuevo = { ...prev };
      alumnosFiltrados().forEach((a) => {
        nuevo[a.id] = { ...nuevo[a.id], presente: valor };
      });
      return nuevo;
    });
  };

  // ── Filtrar alumnos ───────────────────────────────────────────────────────
  const alumnosFiltrados = useCallback(() => {
    return alumnos.filter((a) => {
      const porRuta = rutaFiltro === 'Todas' || a.ruta === rutaFiltro;
      const porNombre = a.nombre.toLowerCase().includes(busqueda.toLowerCase());
      return porRuta && porNombre;
    });
  }, [alumnos, rutaFiltro, busqueda]);

  // ── Resumen estadísticas ─────────────────────────────────────────────────
  const estadisticas = () => {
    const lista = alumnosFiltrados();
    const presentes = lista.filter((a) => estados[a.id]?.presente === true).length;
    const ausentes = lista.filter((a) => estados[a.id]?.presente === false).length;
    const sinMarcar = lista.filter((a) => estados[a.id]?.presente === null).length;
    return { presentes, ausentes, sinMarcar, total: lista.length };
  };

  // ── Guardar en Supabase ───────────────────────────────────────────────────
  const guardarAsistencia = async () => {
    if (!usuario) return Alert.alert('Error', 'No se encontró el usuario.');

    const lista = alumnosFiltrados();
    const sinMarcar = lista.filter((a) => estados[a.id]?.presente === null);

    if (sinMarcar.length > 0) {
      Alert.alert(
        'Alumnos sin marcar',
        `Hay ${sinMarcar.length} alumno(s) sin registrar. ¿Deseas guardar de todas formas?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Guardar igual', onPress: () => ejecutarGuardado(lista) },
        ]
      );
      return;
    }

    ejecutarGuardado(lista);
  };

  const ejecutarGuardado = async (lista) => {
    setGuardando(true);

    const registros = lista
      .filter((a) => estados[a.id]?.presente !== null)
      .map((a) => ({
        alumno_id: a.id,
        docente_id: usuario.id,
        presente: estados[a.id].presente,
        observacion: estados[a.id].observacion || null,
      }));

    const { error } = await supabase.from('asistencia').insert(registros);

    setGuardando(false);

    if (error) {
      Alert.alert('Error al guardar', error.message);
    } else {
      Alert.alert('✓ Guardado', `Se registraron ${registros.length} alumnos correctamente.`);
    }
  };

  // ── Cerrar sesión ─────────────────────────────────────────────────────────
  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    navigation.replace('Login');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const stats = estadisticas();

  return (
    <View style={styles.container}>
      {/* Barra superior */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content
          title="Registro de asistencia"
          titleStyle={styles.appbarTitle}
          subtitle={new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
        />
        <Appbar.Action icon="history" onPress={() => navigation.navigate('Historial')} color="#a78bfa" />
        <Appbar.Action icon="logout" onPress={cerrarSesion} color="#a78bfa" />
      </Appbar.Header>

      {/* Buscador */}
      <Searchbar
        placeholder="Buscar alumno..."
        value={busqueda}
        onChangeText={setBusqueda}
        style={styles.searchbar}
        inputStyle={{ color: '#f0f0f5' }}
        iconColor="#a78bfa"
        placeholderTextColor="#666"
      />

      {/* Filtro de rutas */}
      <View style={styles.rutasRow}>
        {rutas.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.rutaChip, rutaFiltro === r && styles.rutaChipActive]}
            onPress={() => setRutaFiltro(r)}
          >
            <Text style={[styles.rutaChipText, rutaFiltro === r && styles.rutaChipTextActive]}>
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Estadísticas */}
      <View style={styles.statsRow}>
        <StatBox label="Total" value={stats.total} color="#a78bfa" />
        <StatBox label="Presentes" value={stats.presentes} color="#22c55e" />
        <StatBox label="Ausentes" value={stats.ausentes} color="#ef4444" />
        <StatBox label="Sin marcar" value={stats.sinMarcar} color="#f59e0b" />
      </View>

      {/* Lista de alumnos */}
      {cargando ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#a78bfa" size="large" />
      ) : (
        <FlatList
          data={alumnosFiltrados()}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <AlumnoItem
              alumno={item}
              estado={estados[item.id] ?? { presente: null, observacion: '' }}
              onChange={(nuevoEstado) => handleCambio(item.id, nuevoEstado)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <Text style={styles.vacio}>No se encontraron alumnos.</Text>
          }
        />
      )}

      {/* Barra inferior de acciones */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.btnSecundario} onPress={() => marcarTodos(true)}>
          <Text style={styles.btnSecundarioText}>✓ Todos presentes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecundario} onPress={() => marcarTodos(false)}>
          <Text style={[styles.btnSecundarioText, { color: '#ef4444' }]}>✗ Todos ausentes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnGuardar, guardando && { opacity: 0.6 }]}
          onPress={guardarAsistencia}
          disabled={guardando}
        >
          <Text style={styles.btnGuardarText}>
            {guardando ? 'Guardando...' : '💾 Guardar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Sub-componente estadística ───────────────────────────────────────────────
function StatBox({ label, value, color }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12121e',
  },
  appbar: {
    backgroundColor: '#1a1a2e',
    elevation: 0,
  },
  appbarTitle: {
    color: '#f0f0f5',
    fontWeight: '700',
    fontSize: 16,
  },
  searchbar: {
    marginHorizontal: 12,
    marginVertical: 8,
    backgroundColor: '#1e1e2e',
    borderRadius: 10,
  },
  rutasRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  rutaChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1e1e2e',
    borderWidth: 1,
    borderColor: '#3a3a4e',
  },
  rutaChipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#6366f1',
  },
  rutaChipText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  rutaChipTextActive: {
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginBottom: 8,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1e1e2e',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: '#666',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  vacio: {
    textAlign: 'center',
    color: '#555',
    marginTop: 60,
    fontSize: 14,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    padding: 12,
    paddingBottom: 24,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  btnSecundario: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2a2a3e',
    alignItems: 'center',
  },
  btnSecundarioText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '600',
  },
  btnGuardar: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
  },
  btnGuardarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});