// screens/HistorialScreen.js
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Appbar } from 'react-native-paper';
import { supabase } from '../supabase';

/**
 * Pantalla de historial de asistencia del docente autenticado.
 * Agrupa los registros por fecha, mostrando resumen por día.
 */
export default function HistorialScreen({ navigation }) {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    setCargando(true);

    const { data: userData } = await supabase.auth.getUser();
    const docenteId = userData?.user?.id;

    if (!docenteId) {
      Alert.alert('Error', 'No se encontró el usuario.');
      setCargando(false);
      return;
    }

    const { data, error } = await supabase
      .from('asistencia')
      .select(`
        id,
        presente,
        observacion,
        fecha,
        alumnos (nombre, curso, ruta)
      `)
      .eq('docente_id', docenteId)
      .order('fecha', { ascending: false })
      .limit(200);

    if (error) {
      Alert.alert('Error', 'No se pudo cargar el historial.');
      setCargando(false);
      return;
    }

    setRegistros(agruparPorFecha(data));
    setCargando(false);
  };

  /**
   * Agrupa los registros en bloques por fecha (día).
   * Retorna array de { fecha, items, presentes, ausentes }
   */
  const agruparPorFecha = (lista) => {
    const mapa = {};

    lista.forEach((r) => {
      const fechaDia = new Date(r.fecha).toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!mapa[fechaDia]) {
        mapa[fechaDia] = { fecha: fechaDia, items: [], presentes: 0, ausentes: 0 };
      }

      mapa[fechaDia].items.push(r);
      if (r.presente) mapa[fechaDia].presentes++;
      else mapa[fechaDia].ausentes++;
    });

    return Object.values(mapa);
  };

  const renderGrupo = ({ item: grupo }) => (
    <View style={styles.grupo}>
      {/* Cabecera del día */}
      <View style={styles.grupoHeader}>
        <Text style={styles.grupoFecha}>{grupo.fecha}</Text>
        <View style={styles.grupoBadges}>
          <Text style={styles.badgePresente}>✓ {grupo.presentes}</Text>
          <Text style={styles.badgeAusente}>✗ {grupo.ausentes}</Text>
        </View>
      </View>

      {/* Registros del día */}
      {grupo.items.map((r) => (
        <View key={r.id} style={styles.registro}>
          <View style={[styles.indicador, r.presente ? styles.presente : styles.ausente]} />
          <View style={styles.registroInfo}>
            <Text style={styles.registroNombre}>{r.alumnos?.nombre}</Text>
            <Text style={styles.registroSub}>
              {r.alumnos?.curso} · Ruta {r.alumnos?.ruta}
            </Text>
            {r.observacion ? (
              <Text style={styles.registroObs}>💬 {r.observacion}</Text>
            ) : null}
          </View>
          <Text style={[styles.registroEstado, r.presente ? styles.presente : styles.ausenteText]}>
            {r.presente ? 'Presente' : 'Ausente'}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#a78bfa" />
        <Appbar.Content title="Historial de asistencia" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon="refresh" onPress={cargarHistorial} color="#a78bfa" />
      </Appbar.Header>

      {cargando ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#a78bfa" size="large" />
      ) : registros.length === 0 ? (
        <Text style={styles.vacio}>No hay registros aún.</Text>
      ) : (
        <FlatList
          data={registros}
          keyExtractor={(item) => item.fecha}
          renderItem={renderGrupo}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

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
  vacio: {
    textAlign: 'center',
    color: '#555',
    marginTop: 80,
    fontSize: 14,
  },
  grupo: {
    marginBottom: 20,
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    overflow: 'hidden',
  },
  grupoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  grupoFecha: {
    color: '#c4b5fd',
    fontWeight: '700',
    fontSize: 13,
    flex: 1,
    textTransform: 'capitalize',
  },
  grupoBadges: {
    flexDirection: 'row',
    gap: 10,
  },
  badgePresente: {
    color: '#22c55e',
    fontWeight: '700',
    fontSize: 13,
  },
  badgeAusente: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 13,
  },
  registro: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  indicador: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginRight: 12,
  },
  presente: {
    backgroundColor: '#22c55e',
    color: '#22c55e',
  },
  ausente: {
    backgroundColor: '#ef4444',
  },
  registroInfo: { flex: 1 },
  registroNombre: {
    color: '#f0f0f5',
    fontWeight: '600',
    fontSize: 14,
  },
  registroSub: {
    color: '#666',
    fontSize: 11,
    marginTop: 1,
  },
  registroObs: {
    color: '#a78bfa',
    fontSize: 11,
    marginTop: 3,
    fontStyle: 'italic',
  },
  registroEstado: {
    fontSize: 12,
    fontWeight: '700',
  },
  ausenteText: {
    color: '#ef4444',
  },
});