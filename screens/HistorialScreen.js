// screens/HistorialScreen.js
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { common } from '../styles/common';
import s from '../styles/historial';
import { supabase } from '../supabase';
import { colors } from '../theme';

export default function HistorialScreen({ navigation }) {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando]   = useState(true);

  useEffect(() => { cargarHistorial(); }, []);

  const cargarHistorial = async () => {
    setCargando(true);
    const { data: userData } = await supabase.auth.getUser();
    const docenteId = userData?.user?.id;
    if (!docenteId) { Alert.alert('Error', 'No se encontró el usuario.'); setCargando(false); return; }

    const { data, error } = await supabase
      .from('asistencia')
      .select(`id, presente, observacion, fecha, alumnos (nombre, curso)`)
      .eq('docente_id', docenteId)
      .order('fecha', { ascending: false })
      .limit(200);

    if (error) { Alert.alert('Error', 'No se pudo cargar el historial.'); }
    else       { setRegistros(agruparPorFecha(data)); }
    setCargando(false);
  };

  const agruparPorFecha = (lista) => {
    const mapa = {};
    lista.forEach((r) => {
      const fechaDia = new Date(r.fecha).toLocaleDateString('es-CL', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
      if (!mapa[fechaDia]) mapa[fechaDia] = { fecha: fechaDia, items: [], presentes: 0, ausentes: 0 };
      mapa[fechaDia].items.push(r);
      if (r.presente) mapa[fechaDia].presentes++;
      else            mapa[fechaDia].ausentes++;
    });
    return Object.values(mapa);
  };

  const renderGrupo = ({ item: grupo }) => (
    <View style={s.grupo}>
      <View style={s.grupoHeader}>
        <Text style={s.grupoFecha}>{grupo.fecha}</Text>
        <View style={s.grupoBadges}>
          <Text style={s.badgePresente}>✓ {grupo.presentes}</Text>
          <Text style={s.badgeAusente}>✗ {grupo.ausentes}</Text>
        </View>
      </View>

      {grupo.items.map((r) => (
        <View key={r.id} style={s.registro}>
          <View style={[s.indicador, r.presente ? s.indicadorPresente : s.indicadorAusente]} />
          <View style={s.registroInfo}>
            <Text style={s.registroNombre}>{r.alumnos?.nombre}</Text>
            <Text style={s.registroSub}>{r.alumnos?.curso}</Text>
            {r.observacion ? <Text style={s.registroObs}>💬 {r.observacion}</Text> : null}
          </View>
          <Text style={r.presente ? s.registroEstadoPresente : s.registroEstadoAusente}>
            {r.presente ? 'Presente' : 'Ausente'}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={common.screen}>
      <Appbar.Header style={common.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={colors.primary} />
        <Appbar.Content title="Historial de asistencia" titleStyle={common.appbarTitle} />
        <Appbar.Action icon="refresh" onPress={cargarHistorial} color={colors.primary} />
      </Appbar.Header>

      {cargando ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={colors.primary} size="large" />
      ) : registros.length === 0 ? (
        <Text style={common.emptyText}>No hay registros aún.</Text>
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