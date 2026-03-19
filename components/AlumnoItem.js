// components/AlumnoItem.js
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Surface } from 'react-native-paper';

/**
 * Tarjeta de alumno con toggle presente/ausente y campo de observación.
 * Props:
 *   alumno      → objeto { id, nombre, curso, ruta }
 *   estado      → { presente: bool, observacion: string }
 *   onChange    → fn({ presente, observacion }) llamada al cambiar cualquier valor
 */
export default function AlumnoItem({ alumno, estado, onChange }) {
  const [showObs, setShowObs] = useState(false);

  const togglePresente = (valor) => {
    onChange({ ...estado, presente: valor });
  };

  const handleObsChange = (texto) => {
    onChange({ ...estado, observacion: texto });
  };

  const esPresente = estado.presente === true;
  const esAusente = estado.presente === false;

  return (
    <Surface style={styles.card} elevation={2}>
      {/* Encabezado: nombre + ruta */}
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.nombre}>{alumno.nombre}</Text>
          <Text style={styles.sub}>{alumno.curso} · Ruta {alumno.ruta}</Text>
        </View>
        <View style={styles.rutaBadge}>
          <Text style={styles.rutaText}>{alumno.ruta}</Text>
        </View>
      </View>

      {/* Botones presente / ausente */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.btn, esPresente && styles.btnPresenteActive]}
          onPress={() => togglePresente(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnText, esPresente && styles.btnTextActive]}>
            ✓ Presente
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, esAusente && styles.btnAusenteActive]}
          onPress={() => togglePresente(false)}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnText, esAusente && styles.btnTextActive]}>
            ✗ Ausente
          </Text>
        </TouchableOpacity>
      </View>

      {/* Observación */}
      <TouchableOpacity
        onPress={() => setShowObs(!showObs)}
        style={styles.obsToggle}
      >
        <Text style={styles.obsToggleText}>
          {showObs ? '▲ Ocultar observación' : '▼ Agregar observación'}
          {estado.observacion ? ' ●' : ''}
        </Text>
      </TouchableOpacity>

      {showObs && (
        <TextInput
          style={styles.obsInput}
          placeholder="Escribe una observación..."
          placeholderTextColor="#888"
          value={estado.observacion}
          onChangeText={handleObsChange}
          multiline
          numberOfLines={2}
          maxLength={200}
        />
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    marginHorizontal: 12,
    backgroundColor: '#1e1e2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  info: { flex: 1 },
  nombre: {
    color: '#f0f0f5',
    fontSize: 15,
    fontWeight: '600',
  },
  sub: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  rutaBadge: {
    backgroundColor: '#2a2a3e',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rutaText: {
    color: '#a78bfa',
    fontWeight: '700',
    fontSize: 13,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#3a3a4e',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
  },
  btnPresenteActive: {
    backgroundColor: '#166534',
    borderColor: '#22c55e',
  },
  btnAusenteActive: {
    backgroundColor: '#7f1d1d',
    borderColor: '#ef4444',
  },
  btnText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 13,
  },
  btnTextActive: {
    color: '#fff',
  },
  obsToggle: {
    paddingVertical: 4,
  },
  obsToggleText: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: '500',
  },
  obsInput: {
    marginTop: 6,
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    padding: 10,
    color: '#f0f0f5',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#3a3a4e',
    textAlignVertical: 'top',
  },
});