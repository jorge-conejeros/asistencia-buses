import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { supabase } from '../supabase'

export async function exportarHistorialCSV(docenteId, fechaDesde, fechaHasta) {
  // 1. Obtener datos
  const { data, error } = await supabase
    .from('asistencia')
    .select(`
      fecha,
      turno,
      presente,
      observacion,
      perfiles!docente_id (nombre_usuario),
      alumnos!alumno_id (nombre_completo, curso)
    `)
    .eq('docente_id', docenteId)
    .gte('fecha', fechaDesde)
    .lte('fecha', fechaHasta)
    .order('fecha', { ascending: true })
    .order('turno', { ascending: true })

  if (error) throw error

  // 2. Construir CSV
  const encabezado = 'Fecha,Turno,Docente,Estudiante,Curso,Asistencia,Observacion\n'

  const filas = data.map(r => {
    const fecha = new Date(r.fecha).toLocaleDateString('es-CL')
    const turno = r.turno
    const docente = r.perfiles?.nombre_usuario ?? ''
    const estudiante = r.alumnos?.nombre_completo ?? ''
    const curso = r.alumnos?.curso ?? ''
    const asistencia = r.presente ? 'Presente' : 'Ausente'
    const obs = (r.observacion ?? '').replace(/,/g, ';').replace(/\n/g, ' ')

    return `${fecha},${turno},${docente},${estudiante},${curso},${asistencia},${obs}`
  }).join('\n')

  const contenido = encabezado + filas

  // 3. Guardar y compartir
  const ruta = FileSystem.documentDirectory + 'historial_asistencia.csv'
  await FileSystem.writeAsStringAsync(ruta, contenido, {
    encoding: FileSystem.EncodingType.UTF8
  })

  await Sharing.shareAsync(ruta, {
    mimeType: 'text/csv',
    dialogTitle: 'Exportar historial de asistencia',
    UTI: 'public.comma-separated-values-text'
  })
}