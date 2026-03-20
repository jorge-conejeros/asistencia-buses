// screens/AsistenciaScreen.js
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  Text, TouchableOpacity,
  View,
} from 'react-native';
import { Appbar, Searchbar } from 'react-native-paper';
import AlumnoItem from '../components/AlumnoItem';
import s from '../styles/asistencia';
import { common } from '../styles/common';
import { supabase } from '../supabase';
import { colors } from '../theme';

/**
 * Modos de pantalla:
 *   'cargando'       → verificando listas del día
 *   'elegir_turno'   → ningún turno registrado → elegir mañana o tarde
 *   'sin_lista'      → turno elegido, sin lista aún → ingreso normal
 *   'ver_lista'      → turno(s) ya registrado(s) → banners por turno
 *   'editar'         → editando lista de un turno específico
 */
export default function AsistenciaScreen({ navigation }) {
  const [alumnos, setAlumnos]             = useState([]);
  const [estados, setEstados]             = useState({});
  const [busqueda, setBusqueda]           = useState('');
  const [modo, setModo]                   = useState('cargando');
  const [guardando, setGuardando]         = useState(false);
  const [usuario, setUsuario]             = useState(null);
  // Registros separados por turno
  const [registrosMañana, setRegistrosMañana] = useState([]);
  const [registrosTarde, setRegistrosTarde]   = useState([]);
  // Turno activo al ingresar/editar
  const [turnoActivo, setTurnoActivo]     = useState(null); // 'mañana' | 'tarde'

  const fechaHoy = new Date().toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const rangoHoy = () => {
    const inicio = new Date(); inicio.setHours(0, 0, 0, 0);
    const fin    = new Date(); fin.setHours(23, 59, 59, 999);
    return { inicio: inicio.toISOString(), fin: fin.toISOString() };
  };

  // ── Iniciar al enfocar ───────────────────────────────────────
  useEffect(() => {
    const unsub = navigation.addListener('focus', iniciar);
    return unsub;
  }, [navigation]);

  const iniciar = async () => {
    setModo('cargando');
    const u = await obtenerUsuario();
    if (!u) {
      console.warn('iniciar: no se encontró usuario autenticado');
      return;
    }
    await Promise.all([cargarAlumnos(), verificarListasHoy(u.id)]);
  };

  const obtenerUsuario = async () => {
    const { data } = await supabase.auth.getUser();
    const u = data?.user ?? null;
    setUsuario(u);
    return u;
  };

  // ── Alumnos vigentes ─────────────────────────────────────────
  const cargarAlumnos = async () => {
    const { data, error } = await supabase
      .from('alumnos')
      .select('id, nombre, curso, vigente')
      .eq('vigente', true)
      .order('curso')
      .order('nombre');
    if (error) { Alert.alert('Error', 'No se pudieron cargar los alumnos.'); return; }
    setAlumnos(data);
    inicializarEstados(data);
  };

  const inicializarEstados = (lista) => {
    const ini = {};
    lista.forEach((a) => { ini[a.id] = { presente: null, observacion: '' }; });
    setEstados(ini);
  };

  // ── Verificar listas del día (ambos turnos) ──────────────────
  const verificarListasHoy = async (docenteId) => {
    const { inicio, fin } = rangoHoy();

    // Query simple sin joins a perfiles (la FK apunta a auth.users, no a perfiles)
    // Los datos del docente se obtienen del estado usuario ya disponible
    const { data, error } = await supabase
      .from('asistencia')
      .select('id, alumno_id, presente, observacion, fecha, turno, modificado_por, modificado_en')
      .eq('docente_id', docenteId)
      .gte('fecha', inicio)
      .lte('fecha', fin)
      .order('fecha', { ascending: false });

    if (error) {
      console.warn('verificarListasHoy error:', error.message);
      setModo('elegir_turno');
      return;
    }

    if (!data || data.length === 0) {
      setModo('elegir_turno');
      return;
    }

    // Separar por turno
    const manana = data.filter((r) => r.turno === 'mañana');
    const tarde  = data.filter((r) => r.turno === 'tarde');
    setRegistrosMañana(manana);
    setRegistrosTarde(tarde);
    setModo('ver_lista');
  };

  // ── Elegir turno → iniciar ingreso ───────────────────────────
  const elegirTurno = (turno) => {
    setTurnoActivo(turno);
    inicializarEstados(alumnos);
    setModo('sin_lista');
  };

  // ── Entrar a modo edición de un turno específico ─────────────
  const entrarModoEdicion = (registros, turno) => {
    const previos = {};
    registros.forEach((r) => {
      previos[r.alumno_id] = {
        registroId:  r.id,
        presente:    r.presente,
        observacion: r.observacion ?? '',
      };
    });
    // Alumnos sin registro previo en ese turno
    alumnos.forEach((a) => {
      if (!previos[a.id]) previos[a.id] = { registroId: null, presente: null, observacion: '' };
    });
    setEstados(previos);
    setTurnoActivo(turno);
    setModo('editar');
  };

  // ── Estado individual ────────────────────────────────────────
  const handleCambio = useCallback((alumnoId, nuevoEstado) => {
    setEstados((prev) => ({ ...prev, [alumnoId]: nuevoEstado }));
  }, []);

  const marcarTodos = (valor) => {
    setEstados((prev) => {
      const nuevo = { ...prev };
      alumnosFiltrados().forEach((a) => {
        nuevo[a.id] = { ...nuevo[a.id], presente: valor };
      });
      return nuevo;
    });
  };

  // ── Filtro ───────────────────────────────────────────────────
  const alumnosFiltrados = useCallback(() => {
    return alumnos.filter((a) =>
      a.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [alumnos, busqueda]);

  // ── Estadísticas ─────────────────────────────────────────────
  const estadisticas = () => {
    const lista = alumnosFiltrados();
    return {
      total:     lista.length,
      presentes: lista.filter((a) => estados[a.id]?.presente === true).length,
      ausentes:  lista.filter((a) => estados[a.id]?.presente === false).length,
      sinMarcar: lista.filter((a) => estados[a.id]?.presente === null).length,
    };
  };

  // ── Alerta sin marcar ────────────────────────────────────────
  const alertaSinMarcar = (sinMarcar, onConfirm) => {
    const MAX    = 5;
    const nombres = sinMarcar.slice(0, MAX).map((a) => `• ${a.nombre}`);
    if (sinMarcar.length > MAX) nombres.push(`\ny ${sinMarcar.length - MAX} más...`);
    Alert.alert(
      `${sinMarcar.length} alumno(s) sin marcar`,
      `Sin asistencia registrada:\n\n${nombres.join('\n')}\n\n¿Guardar de todas formas?`,
      [{ text: 'Cancelar', style: 'cancel' }, { text: 'Guardar igual', onPress: onConfirm }]
    );
  };

  // ── Guardar lista nueva ───────────────────────────────────────
  const guardarAsistencia = async () => {
    if (!usuario || !turnoActivo) return;
    const lista     = alumnosFiltrados();
    const sinMarcar = lista.filter((a) => estados[a.id]?.presente === null);
    if (sinMarcar.length > 0) {
      alertaSinMarcar(sinMarcar, () => ejecutarGuardado(lista));
      return;
    }
    ejecutarGuardado(lista);
  };

  const ejecutarGuardado = async (lista) => {
    setGuardando(true);
    const registros = lista
      .filter((a) => estados[a.id]?.presente !== null)
      .map((a) => ({
        alumno_id:   a.id,
        docente_id:  usuario.id,
        presente:    estados[a.id].presente,
        observacion: estados[a.id].observacion || null,
        turno:       turnoActivo,
        fecha:       new Date().toISOString(),
      }));

    const { error } = await supabase.from('asistencia').insert(registros);
    setGuardando(false);

    if (error) { Alert.alert('Error al guardar', error.message); return; }
    Alert.alert(
      '✓ Lista guardada',
      `Turno ${turnoActivo} · ${registros.length} alumno(s) registrados.`
    );
    await verificarListasHoy(usuario.id);
  };

  // ── Guardar edición ───────────────────────────────────────────
  const guardarEdicion = async () => {
    if (!usuario) return;
    const listaCompleta = alumnos;
    const sinMarcar     = listaCompleta.filter((a) => estados[a.id]?.presente === null);
    if (sinMarcar.length > 0) {
      alertaSinMarcar(sinMarcar, () => ejecutarEdicion(listaCompleta));
      return;
    }
    ejecutarEdicion(listaCompleta);
  };

  const ejecutarEdicion = async (lista) => {
    setGuardando(true);
    const ahora = new Date().toISOString();

    // Separar registros a actualizar vs insertar
    const aActualizar = lista.filter(
      (a) => estados[a.id]?.registroId != null && estados[a.id]?.presente !== null
    );
    const aInsertar = lista.filter(
      (a) => estados[a.id]?.registroId == null && estados[a.id]?.presente !== null
    );

    // ── Updates: uno por uno para capturar errores individuales ──
    // Incluir docente_id en el WHERE para satisfacer la política RLS
    const erroresUpdate = [];
    for (const a of aActualizar) {
      const { error } = await supabase
        .from('asistencia')
        .update({
          presente:       estados[a.id].presente,
          observacion:    estados[a.id].observacion || null,
          modificado_por: usuario.id,
          modificado_en:  ahora,
        })
        .eq('id', estados[a.id].registroId)
        .eq('docente_id', usuario.id);   // ← satisface RLS policy

      if (error) erroresUpdate.push(a.nombre);
    }

    // ── Inserts: nuevos registros del turno activo ──
    let errorInsert = null;
    if (aInsertar.length > 0) {
      const { error } = await supabase.from('asistencia').insert(
        aInsertar.map((a) => ({
          alumno_id:   a.id,
          docente_id:  usuario.id,
          presente:    estados[a.id].presente,
          observacion: estados[a.id].observacion || null,
          turno:       turnoActivo,
          fecha:       ahora,
        }))
      );
      errorInsert = error;
    }

    setGuardando(false);

    if (erroresUpdate.length > 0 || errorInsert) {
      const msg = erroresUpdate.length > 0
        ? `No se pudieron actualizar: ${erroresUpdate.join(', ')}`
        : 'Error al insertar nuevos registros.';
      Alert.alert('Error parcial', msg);
    } else {
      Alert.alert(
        '✓ Edición guardada',
        `Actualizados: ${aActualizar.length}${aInsertar.length > 0 ? ` · Nuevos: ${aInsertar.length}` : ''}`
      );
      await verificarListasHoy(usuario.id);
      setModo('ver_lista');
    }
  };

  // ── Cerrar sesión ─────────────────────────────────────────────
  const cerrarSesion = async () => { await supabase.auth.signOut(); };

  // ── Componente: banner de un turno ───────────────────────────
  const BannerTurno = ({ registros, turno }) => {
    if (!registros || registros.length === 0) return null;

    const presentes = registros.filter((r) => r.presente).length;
    const ausentes  = registros.filter((r) => !r.presente).length;
    const primer    = registros[0];

    // Usar el email del usuario actual (ya disponible en estado)
    // En futuro se puede enriquecer con nombre_usuario desde perfiles
    const nombreDocente = usuario?.email?.split('@')[0] ?? 'Docente';
    const nombreModif   = primer?.modificado_por
      ? primer.modificado_por.substring(0, 8) + '...'
      : null;

    const horaRegistro = primer?.fecha
      ? new Date(primer.fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
      : '';
    const horaModif = primer?.modificado_en
      ? new Date(primer.modificado_en).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
      : null;

    const esMañana = turno === 'mañana';

    return (
      <View style={[s.bannerContainer, esMañana ? s.bannerManana : s.bannerTarde]}>
        <Text style={s.bannerIconoText}>{esMañana ? '🌅' : '🌆'}</Text>
        <View style={s.bannerInfo}>
          <Text style={[s.bannerTurnoTag, esMañana ? s.tagManana : s.tagTarde]}>
            {esMañana ? 'TURNO MAÑANA' : 'TURNO TARDE'}
          </Text>
          <Text style={s.bannerSub}>
            {registros.length} alumnos · {presentes} presentes · {ausentes} ausentes
          </Text>
          <Text style={s.bannerMeta}>
            📋 {nombreDocente}{horaRegistro ? ` · ${horaRegistro}` : ''}
          </Text>
          {nombreModif && (
            <Text style={s.bannerMetaEdicion}>
              ✏️ Editado por {nombreModif}{horaModif ? ` · ${horaModif}` : ''}
            </Text>
          )}
        </View>
        <View style={s.bannerBotones}>
          <TouchableOpacity style={s.btnVerLista} onPress={() => navigation.navigate('Historial')}>
            <Text style={s.btnVerListaText}>Ver</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnEditarLista} onPress={() => entrarModoEdicion(registros, turno)}>
            <Text style={s.btnEditarListaText}>Editar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ── Componente: selector de turno ────────────────────────────
  const SelectorTurno = () => {
    const tieneMañana = registrosMañana.length > 0;
    const tieneTarde  = registrosTarde.length > 0;

    return (
      <View style={s.selectorTurnoContainer}>
        <Text style={s.selectorTurnoTitulo}>¿Qué turno vas a registrar?</Text>
        <View style={s.selectorTurnoBotones}>
          <TouchableOpacity
            style={[s.btnTurno, tieneMañana && s.btnTurnoYaRegistrado]}
            onPress={() => tieneMañana
              ? entrarModoEdicion(registrosMañana, 'mañana')
              : elegirTurno('mañana')
            }
          >
            <Text style={s.btnTurnoIcono}>🌅</Text>
            <Text style={s.btnTurnoLabel}>Mañana</Text>
            {tieneMañana && <Text style={s.btnTurnoYaTag}>✓ Registrado</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.btnTurno, tieneTarde && s.btnTurnoYaRegistrado]}
            onPress={() => tieneTarde
              ? entrarModoEdicion(registrosTarde, 'tarde')
              : elegirTurno('tarde')
            }
          >
            <Text style={s.btnTurnoIcono}>🌆</Text>
            <Text style={s.btnTurnoLabel}>Tarde</Text>
            {tieneTarde && <Text style={s.btnTurnoYaTag}>✓ Registrado</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const stats = estadisticas();

  return (
    <View style={common.screen}>
      {/* Appbar */}
      <Appbar.Header style={common.appbar}>
        <Appbar.Content title="Registro de asistencia" titleStyle={common.appbarTitle} />
        <Appbar.Action icon="account-group" onPress={() => navigation.navigate('Alumnos')}   color={colors.primary} />
        <Appbar.Action icon="account-circle"  onPress={() => navigation.navigate('Perfil')}    color={colors.primary} />
        <Appbar.Action icon="history"       onPress={() => navigation.navigate('Historial')}  color={colors.primary} />
        <Appbar.Action icon="logout"        onPress={cerrarSesion} color={colors.primary} />
      </Appbar.Header>

      {/* Fecha */}
      <View style={s.fechaRow}>
        <Text style={s.fechaTexto}>📅 {fechaHoy}</Text>
        {modo === 'editar' && (
          <Text style={s.modoEditarTag}>
            ✏️ Editando {turnoActivo === 'mañana' ? 'mañana' : 'tarde'}
          </Text>
        )}
      </View>

      {/* ── Estado: cargando ── */}
      {modo === 'cargando' && (
        <ActivityIndicator style={{ marginTop: 60 }} color={colors.primary} size="large" />
      )}

      {/* ── Estado: elegir turno / ver listas ya registradas ── */}
      {(modo === 'elegir_turno' || modo === 'ver_lista') && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 30 }}>
          {/* Banners de turnos ya registrados */}
          <BannerTurno registros={registrosMañana} turno="mañana" />
          <BannerTurno registros={registrosTarde}  turno="tarde"  />

          {/* Selector para registrar el turno que falta */}
          {(registrosMañana.length === 0 || registrosTarde.length === 0) && (
            <SelectorTurno />
          )}
        </ScrollView>
      )}

      {/* ── Estado: formulario de ingreso / edición ── */}
      {(modo === 'sin_lista' || modo === 'editar') && (
        <>
          {/* Indicador de turno activo */}
          <View style={[s.turnoActivoBar, turnoActivo === 'mañana' ? s.turnoBarManana : s.turnoBarTarde]}>
            <Text style={s.turnoActivoTexto}>
              {turnoActivo === 'mañana' ? '🌅 Turno mañana' : '🌆 Turno tarde'}
            </Text>
            {modo === 'editar' && (
              <TouchableOpacity onPress={() => setModo('ver_lista')}>
                <Text style={s.aviosoCancelar}>Cancelar edición</Text>
              </TouchableOpacity>
            )}
            {modo === 'sin_lista' && (
              <TouchableOpacity onPress={() => setModo('elegir_turno')}>
                <Text style={s.aviosoCancelar}>Cambiar turno</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Aviso edición */}
          {modo === 'editar' && (
            <View style={s.avisoEdicion}>
              <Text style={s.avisoEdicionTexto}>
                ⚠️ Editando lista existente. Los cambios quedarán registrados con tu usuario.
              </Text>
            </View>
          )}

          {/* Buscador */}
          <Searchbar
            placeholder="Buscar alumno..."
            value={busqueda}
            onChangeText={setBusqueda}
            style={common.searchbar}
            inputStyle={{ color: colors.textPrimary }}
            iconColor={colors.primary}
            placeholderTextColor={colors.textMuted}
          />

{/* Estadísticas */}
          <View style={s.statsRow}>
            <StatBox label="Total"      value={stats.total}     color={colors.primary} />
            <StatBox label="Presentes"  value={stats.presentes} color={colors.success} />
            <StatBox label="Ausentes"   value={stats.ausentes}  color={colors.danger}  />
            <StatBox label="Sin marcar" value={stats.sinMarcar} color={colors.warning} />
          </View>

          {/* Lista */}
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
            ListEmptyComponent={<Text style={common.emptyText}>No se encontraron alumnos.</Text>}
          />

          {/* Barra inferior */}
          <View style={common.bottomBar}>
            <TouchableOpacity style={common.btnSecondary} onPress={() => marcarTodos(true)}>
              <Text style={[common.btnSecondaryText, { color: colors.success }]}>✓ Presentes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={common.btnSecondary} onPress={() => marcarTodos(false)}>
              <Text style={[common.btnSecondaryText, { color: colors.danger }]}>✗ Ausentes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[common.btnPrimary, guardando && { opacity: 0.6 }]}
              onPress={modo === 'editar' ? guardarEdicion : guardarAsistencia}
              disabled={guardando}
            >
              <Text style={common.btnPrimaryText}>
                {guardando ? 'Guardando...' : modo === 'editar' ? '💾 Guardar cambios' : '💾 Guardar lista'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

function StatBox({ label, value, color }) {
  return (
    <View style={s.statBox}>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}